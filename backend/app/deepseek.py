"""
DeepSeek-VL2 Food Detection Module
Uses deepseek-ai/deepseek-vl2-small via Transformers pipeline (image-text-to-text)
Falls back to local AutoModel or HF Inference API if needed.
"""
import logging
import os
from typing import List, Dict, Any
from PIL import Image
import torch
from transformers import AutoTokenizer, AutoModel, pipeline
from huggingface_hub import InferenceClient

logger = logging.getLogger(__name__)


class DeepSeekFoodDetector:
    
    FOOD_DETECTOR_PROMPT = """TASK: Identify every real, visible food item in the image ONLY.
RULES: No guessing, no description, no sentences. Only list foods present.
OUTPUT: Comma-separated lowercase list, e.g. rice, beans, chicken. If none, return "none"."""

    def __init__(self, model_name: str = "deepseek-ai/deepseek-vl2-small", device: str = None):
    
        self.model_name = model_name
        
        # Auto-detect device if not specified
        if device is None:
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
        else:
            self.device = device
            
        logger.info(f"Initializing DeepSeek-VL2 on device: {self.device}")
        
        self.local_ready = False
        self.client: InferenceClient | None = None
        
        # Preferred: use Transformers pipeline for image-text-to-text
        self.pipe = None
        try:
            self.pipe = pipeline(
                task="image-text-to-text",
                model=model_name,
                device=0 if self.device == "cuda" else -1,
                trust_remote_code=True
            )
            self.local_ready = True
            logger.info("DeepSeek-VL2 pipeline initialized (image-text-to-text)")
        except Exception as e:
            logger.error(f"Failed to init DeepSeek pipeline: {e}")
            # Attempt local model load as secondary path
            try:
                self.tokenizer = AutoTokenizer.from_pretrained(
                    model_name,
                    trust_remote_code=True
                )
                self.model = AutoModel.from_pretrained(
                    model_name,
                    trust_remote_code=True,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
                )
                self.model.to(self.device)
                self.model.eval()
                self.local_ready = True
                logger.info(f"DeepSeek-VL2 model loaded locally on {self.device}")
            except Exception as e2:
                logger.error(f"Failed local DeepSeek load: {e2}")
                # Fallback to Inference API if token available
                hf_token = os.environ.get("HF_TOKEN")
                if hf_token:
                    try:
                        self.client = InferenceClient(model=model_name, token=hf_token)
                        logger.info("DeepSeek-VL2 Inference API client initialized")
                    except Exception as api_err:
                        logger.error(f"Failed to initialize Inference API client: {api_err}")
                        # Leave detectors disabled; will gracefully return []
                else:
                    logger.warning("DeepSeek-VL2 unavailable: set HF_TOKEN or install latest transformers")
    
    def detect_foods(self, image: Image.Image, confidence_threshold: float = 0.3) -> List[Dict[str, Any]]:
        """
        Detect food items in image using DeepSeek-VL2.
        
        Args:
            image: PIL Image
            confidence_threshold: Minimum confidence score (0-1)
            
        Returns:
            List of detected foods with metadata:
            [
                {
                    "name": "rice",
                    "confidence": 0.85,
                    "source": "deepseek"
                },
                ...
            ]
        """
        try:
            logger.info("Running DeepSeek-VL2 food detection...")
            
            # Preferred: pipeline path
            if self.pipe is not None:
                messages = [{
                    "role": "user",
                    "content": [
                        {"type": "image", "image": image},
                        {"type": "text", "text": self.FOOD_DETECTOR_PROMPT}
                    ]
                }]
                # Deterministic behavior: set temperature low if supported
                try:
                    response = self.pipe(text=messages)
                except TypeError:
                    # Some versions use different arg names
                    response = self.pipe(messages)
                if isinstance(response, list) and response:
                    # HF pipeline may return list of strings or dicts
                    resp_text = response[0] if isinstance(response[0], str) else response[0].get("generated_text", "")
                    response = str(resp_text)
                else:
                    response = ""
            # Local AutoModel path (best-effort, may differ by arch)
            elif self.local_ready and hasattr(self, 'tokenizer') and hasattr(self, 'model'):
                inputs = self.tokenizer(
                    self.FOOD_DETECTOR_PROMPT,
                    images=image,
                    return_tensors="pt"
                ).to(self.device)
                with torch.no_grad():
                    outputs = self.model.generate(
                        **inputs,
                        max_new_tokens=100,
                        do_sample=False,
                        temperature=0.1,
                        top_p=0.9,
                    )
                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Inference API path
            elif self.client is not None:
                # Send prompt + image to HF Inference API
                # Note: client.image_to_text requires pillow Image
                response = self.client.image_to_text(image=image, prompt=self.FOOD_DETECTOR_PROMPT)
            else:
                logger.warning("DeepSeek-VL2 not available; returning empty list")
                return []
            
            # Extract food list from response
            foods = self._parse_food_list(response)
            
            # Convert to structured format with confidence estimation
            results = []
            for food in foods:
                if food and food != "none":
                    results.append({
                        "name": food.strip().lower(),
                        "confidence": confidence_threshold + 0.1,  # Base confidence for VLM
                        "source": "deepseek"
                    })
            
            logger.info(f"DeepSeek detected {len(results)} food items: {[r['name'] for r in results]}")
            return results
            
        except Exception as e:
            logger.error(f"DeepSeek detection failed: {e}")
            return []
    
    def _parse_food_list(self, response: str) -> List[str]:
        """
        Parse comma-separated food list from model response.
        
        Args:
            response: Raw model output text
            
        Returns:
            List of food names
        """
        # Clean response
        response = response.strip().lower()
        
        # Handle "none" case
        if "none" in response or not response:
            return []
        
        # Split by comma and clean each item
        foods = []
        for item in response.split(","):
            # Remove common filler words and phrases
            item = item.strip()
            item = item.replace("the ", "")
            item = item.replace("a ", "")
            item = item.replace("an ", "")
            item = item.replace("some ", "")
            
            # Skip if too short or contains sentence indicators
            if len(item) > 2 and "." not in item and len(item.split()) <= 3:
                foods.append(item)
        
        return foods
    
    def __del__(self):
        """Cleanup resources on deletion."""
        try:
            if hasattr(self, 'model'):
                del self.model
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
        except:
            pass

# Upgrade transformers to latest version
os.system('pip install --upgrade "git+https://github.com/huggingface/transformers.git"')
