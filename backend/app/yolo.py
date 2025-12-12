"""
YOLO Food Detection Module
Handles food detection using YOLOv8 ONNX model
"""
import logging
from typing import List, Dict, Any
from pathlib import Path
import numpy as np
from PIL import Image
from ultralytics import YOLO
import cv2

logger = logging.getLogger(__name__)


class YOLOFoodDetector:    
    def __init__(self, model_path: str = None):
        if model_path is None:
            # Default path to existing model
            base_path = Path(__file__).parent
            model_path = base_path / "ml_models" / "yolo" / "best.onnx"
        
        self.model_path = Path(model_path)
        
        if not self.model_path.exists():
            raise FileNotFoundError(f"YOLO model not found at: {self.model_path}")
        
        logger.info(f"Loading YOLO model from: {self.model_path}")
        
        try:
            # Load YOLO model (Ultralytics handles ONNX)
            self.model = YOLO(str(self.model_path))
            logger.info("YOLO model loaded successfully")
            
            # Load class names if available
            yaml_path = self.model_path.parent / "chownet_data.yaml"
            self.class_names = self._load_class_names(yaml_path)
            
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
            raise
    
    def _load_class_names(self, yaml_path: Path) -> Dict[int, str]:
        """Load class names from YAML file."""
        try:
            if yaml_path.exists():
                import yaml
                with open(yaml_path, 'r') as f:
                    data = yaml.safe_load(f)
                    if 'names' in data:
                        return data['names']
        except Exception as e:
            logger.warning(f"Could not load class names from YAML: {e}")
        
        # Fallback: use model's built-in names if available
        if hasattr(self.model, 'names'):
            return self.model.names
        
        return {}
    
    def detect_foods(
        self,
        image: Image.Image,
        confidence_threshold: float = 0.25,
        iou_threshold: float = 0.45
    ) -> List[Dict[str, Any]]:
       
        try:
            logger.info(f"Running YOLO detection with confidence >= {confidence_threshold}")
            
            # Convert PIL to numpy array for YOLO
            img_array = np.array(image)
            
            # Run inference
            results = self.model.predict(
                img_array,
                conf=confidence_threshold,
                iou=iou_threshold,
                verbose=False
            )
            
            # Parse results
            detections = []
            
            for result in results:
                boxes = result.boxes
                
                for box in boxes:
                    # Extract detection info
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    bbox = box.xyxy[0].cpu().numpy().tolist()
                    
                    # Get class name
                    class_name = self.class_names.get(class_id, f"class_{class_id}")
                    
                    detections.append({
                        "name": class_name.lower(),
                        "confidence": confidence,
                        "bbox": bbox,
                        "source": "yolo"
                    })
            
            logger.info(f"YOLO detected {len(detections)} food items: {[d['name'] for d in detections]}")
            return detections
            
        except Exception as e:
            logger.error(f"YOLO detection failed: {e}")
            return []
    
    def get_class_names(self) -> Dict[int, str]:
        return self.class_names.copy()
    
    def __del__(self):
        try:
            if hasattr(self, 'model'):
                del self.model
        except:
            pass
