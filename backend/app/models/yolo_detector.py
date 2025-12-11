"""
YOLO Detector - Wrapper for YOLOv8 food detection model
Detects and localizes foods in images
"""
import os
from typing import List, Tuple, Optional, Dict
from pathlib import Path

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False


class YOLODetector:
    """
    YOLOv8 detector wrapper for food detection
    Detects multiple food items in an image
    """
    
    def __init__(self, model_name: str = "yolov8n.pt", custom_model_path: Optional[str] = None):
        """
        Initialize YOLO detector
        
        Args:
            model_name: Pre-trained model name (default: nano for speed)
            custom_model_path: Path to custom fine-tuned YOLO model
        """
        self.model = None
        self.model_path = custom_model_path
        self.model_name = model_name
        
        if YOLO_AVAILABLE:
            self._initialize_model()
        else:
            print("Warning: YOLOv8 not available. Using mock detector.")
    
    def _initialize_model(self):
        """Initialize YOLO model"""
        try:
            # Load custom model if provided, otherwise use pre-trained
            if self.model_path and os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
                print(f"Loaded custom YOLO model from {self.model_path}")
            else:
                self.model = YOLO(self.model_name)
                print(f"Loaded pre-trained YOLO model: {self.model_name}")
        except Exception as e:
            print(f"Error loading YOLO model: {e}")
            self.model = None
    
    def detect(self, image_path: str, confidence: float = 0.5) -> List[Dict]:
        """
        Detect foods in image
        
        Args:
            image_path: Path to image
            confidence: Confidence threshold (0.0-1.0)
            
        Returns:
            List of detections with format:
            [
                {
                    'class': 'apple',
                    'confidence': 0.95,
                    'bbox': {'x1': 100, 'y1': 50, 'x2': 200, 'y2': 150},
                    'area': (100, 100)
                },
                ...
            ]
        """
        if not YOLO_AVAILABLE or self.model is None:
            return self._mock_detect(image_path, confidence)
        
        try:
            # Run inference
            results = self.model.predict(image_path, conf=confidence, verbose=False)
            
            detections = []
            for result in results:
                for box in result.boxes:
                    detection = {
                        'class': result.names[int(box.cls)],
                        'confidence': float(box.conf),
                        'bbox': {
                            'x1': float(box.xyxy[0][0]),
                            'y1': float(box.xyxy[0][1]),
                            'x2': float(box.xyxy[0][2]),
                            'y2': float(box.xyxy[0][3])
                        },
                        'area': (
                            float(box.xyxy[0][2] - box.xyxy[0][0]),
                            float(box.xyxy[0][3] - box.xyxy[0][1])
                        )
                    }
                    detections.append(detection)
            
            return detections
            
        except Exception as e:
            print(f"Error during detection: {e}")
            return []
    
    def _mock_detect(self, image_path: str, confidence: float) -> List[Dict]:
        """Mock detection for testing without YOLO"""
        import random
        
        foods = ['apple', 'banana', 'chicken', 'rice', 'broccoli', 'pizza', 'sandwich']
        num_detections = random.randint(1, 3)
        
        detections = []
        for i in range(num_detections):
            x1 = random.randint(0, 200)
            y1 = random.randint(0, 200)
            width = random.randint(50, 150)
            height = random.randint(50, 150)
            
            detection = {
                'class': random.choice(foods),
                'confidence': round(random.uniform(confidence, 0.99), 3),
                'bbox': {
                    'x1': x1,
                    'y1': y1,
                    'x2': x1 + width,
                    'y2': y1 + height
                },
                'area': (width, height)
            }
            detections.append(detection)
        
        return detections
    
    def detect_and_crop(self, image_path: str, confidence: float = 0.5) -> List[Tuple[str, str]]:
        """
        Detect foods and save cropped images
        
        Args:
            image_path: Path to image
            confidence: Confidence threshold
            
        Returns:
            List of tuples (class, cropped_image_path)
        """
        detections = self.detect(image_path, confidence)
        
        try:
            from PIL import Image
            
            image = Image.open(image_path)
            cropped_images = []
            
            for idx, detection in enumerate(detections):
                bbox = detection['bbox']
                cropped = image.crop((bbox['x1'], bbox['y1'], bbox['x2'], bbox['y2']))
                
                # Save cropped image
                crop_path = f"/tmp/crop_{idx}_{detection['class']}.jpg"
                cropped.save(crop_path)
                
                cropped_images.append((detection['class'], crop_path))
            
            return cropped_images
            
        except Exception as e:
            print(f"Error cropping images: {e}")
            return []


# Singleton instance
_detector_instance = None


def get_yolo_detector(model_name: str = "yolov8n.pt", custom_model_path: Optional[str] = None) -> YOLODetector:
    """Get or create YOLO detector instance"""
    global _detector_instance
    if _detector_instance is None:
        _detector_instance = YOLODetector(model_name, custom_model_path)
    return _detector_instance
