import logging
import os
import json
from typing import List, Dict, Any
from PIL import Image
import requests
import base64
from io import BytesIO

logger = logging.getLogger(__name__)


class MistralFoodValidator:
    VALIDATION_PROMPT = """You are a precise food detection system. Analyze this image and the provided YOLO detections.

YOLO DETECTED: {yolo_foods}

TASK:
1. Validate each YOLO detection - confirm if food is actually visible
2. Identify any additional visible food items YOLO missed
3. Return ONLY foods you can clearly see in the image

STRICT RULES:
- NO hallucinations: only report foods clearly visible
- Provide confidence score 0.0-1.0 for each item
- Use lowercase names (e.g., "rice", "chicken", "beans")
- If a YOLO detection is wrong, exclude it
- For additional foods, confidence must be >= 0.3

OUTPUT FORMAT (valid JSON only):
{{
  "validated_foods": [
    {{"name": "rice", "confidence": 0.85, "source": "LLM", "notes": "confirmed present"}},
    {{"name": "beans", "confidence": 0.72, "source": "LLM", "notes": "additional item found"}}
  ]
}}

Return JSON only, no other text."""

    def __init__(self, api_key: str = None, model: str = "pixtral-12b-2409"):
        """
        Initialize Mistral Food Validator.
        
        Args:
            api_key: Mistral API key (defaults to MISTRAL_API_KEY env var)
            model: Mistral vision model to use
        """
        self.api_key = api_key or os.environ.get("MISTRAL_API_KEY")
        self.model = model
        self.api_url = "https://api.mistral.ai/v1/chat/completions"
        
        if not self.api_key:
            logger.warning("MISTRAL_API_KEY not set - Mistral validation will be disabled")
        else:
            logger.info(f"Initialized Mistral validator with model: {model}")
    
    def validate_detections(
        self,
        image: Image.Image,
        yolo_detections: List[Dict[str, Any]],
        confidence_threshold: float = 0.3
    ) -> List[Dict[str, Any]]:
        """
        Validate and extend YOLO detections using Mistral AI.
        
        Args:
            image: PIL Image to analyze
            yolo_detections: List of YOLO detection dicts with 'name', 'confidence', 'source'
            confidence_threshold: Minimum confidence for new detections (0.0-1.0)
            
        Returns:
            List of validated/extended food items:
            [
                {
                    "name": "rice",
                    "confidence": 0.85,
                    "source": "LLM",
                    "notes": "validated by Mistral"
                },
                ...
            ]
        """
        if not self.api_key:
            logger.warning("Mistral API key not available, skipping validation")
            return []
        
        if not yolo_detections:
            logger.info("No YOLO detections to validate")
            return []
        
        try:
            # Extract YOLO food names for prompt
            yolo_food_names = [det['name'] for det in yolo_detections]
            yolo_foods_str = ", ".join(yolo_food_names)
            
            logger.info(f"Validating YOLO detections with Mistral: {yolo_foods_str}")
            
            # Encode image to base64
            image_base64 = self._encode_image(image)
            
            # Build prompt
            prompt = self.VALIDATION_PROMPT.format(yolo_foods=yolo_foods_str)
            
            # Call Mistral API
            response = self._call_mistral_api(image_base64, prompt)
            
            # Parse response
            validated_foods = self._parse_response(response, confidence_threshold)
            
            logger.info(f"Mistral validated {len(validated_foods)} food items")
            return validated_foods
            
        except Exception as e:
            logger.error(f"Mistral validation failed: {e}", exc_info=True)
            return []
    
    def _encode_image(self, image: Image.Image) -> str:
        """
        Encode PIL Image to base64 string.
        
        Args:
            image: PIL Image
            
        Returns:
            Base64 encoded image string
        """
        buffered = BytesIO()
        image.save(buffered, format="JPEG")
        img_bytes = buffered.getvalue()
        return base64.b64encode(img_bytes).decode('utf-8')
    
    def _call_mistral_api(self, image_base64: str, prompt: str) -> dict:
        """
        Call Mistral API with image and prompt.
        
        Args:
            image_base64: Base64 encoded image
            prompt: Analysis prompt
            
        Returns:
            API response dict
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    ]
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.1  # Low temperature for consistent, factual responses
        }
        
        logger.debug(f"Calling Mistral API: {self.api_url}")
        response = requests.post(
            self.api_url,
            headers=headers,
            json=payload,
            timeout=30
        )
        
        response.raise_for_status()
        return response.json()
    
    def _parse_response(
        self,
        api_response: dict,
        confidence_threshold: float
    ) -> List[Dict[str, Any]]:
        """
        Parse Mistral API response and extract validated foods.
        
        Args:
            api_response: Raw API response dict
            confidence_threshold: Minimum confidence to include
            
        Returns:
            List of validated food dicts
        """
        try:
            # Extract content from response
            content = api_response['choices'][0]['message']['content']
            logger.debug(f"Mistral response: {content}")
            
            # Try to parse JSON from response
            # Handle case where response might have markdown code blocks
            if '```json' in content:
                json_start = content.find('```json') + 7
                json_end = content.find('```', json_start)
                content = content[json_start:json_end].strip()
            elif '```' in content:
                json_start = content.find('```') + 3
                json_end = content.find('```', json_start)
                content = content[json_start:json_end].strip()
            
            # Parse JSON
            parsed = json.loads(content)
            
            # Extract validated foods
            validated_foods = parsed.get('validated_foods', [])
            
            # Filter by confidence threshold
            filtered_foods = [
                food for food in validated_foods
                if food.get('confidence', 0) >= confidence_threshold
            ]
            
            logger.info(f"Parsed {len(filtered_foods)} foods meeting confidence threshold {confidence_threshold}")
            return filtered_foods
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Mistral response as JSON: {e}")
            logger.debug(f"Raw response: {api_response}")
            return []
        except (KeyError, IndexError) as e:
            logger.error(f"Unexpected API response structure: {e}")
            logger.debug(f"Raw response: {api_response}")
            return []
        except Exception as e:
            logger.error(f"Error parsing Mistral response: {e}")
            return []


# Convenience function for standalone testing
def test_mistral_validator():
    """Test Mistral validator with a sample image."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python mistral.py <image_path>")
        sys.exit(1)
    
    image_path = sys.argv[1]
    
    # Load image
    image = Image.open(image_path)
    
    # Create validator
    validator = MistralFoodValidator()
    
    # Mock YOLO detections for testing
    yolo_detections = [
        {"name": "rice", "confidence": 0.85, "source": "YOLO"},
        {"name": "chicken", "confidence": 0.78, "source": "YOLO"}
    ]
    
    # Validate
    results = validator.validate_detections(image, yolo_detections)
    
    print("\nValidation Results:")
    print(json.dumps(results, indent=2))


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_mistral_validator()
