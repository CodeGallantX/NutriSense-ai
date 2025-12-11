"""
Food Classifier - Wrapper for fine-tuned food classification model
Supports ResNet18 or custom food classification models
"""
import os
from typing import Tuple, Optional
import numpy as np
from pathlib import Path

try:
    import torch
    import torchvision.models as models
    from torchvision import transforms
    from PIL import Image
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class FoodClassifier:
    """
    Fine-tuned food classifier wrapper
    Loads and uses a pre-trained ResNet18 model for food classification
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the food classifier
        
        Args:
            model_path: Path to fine-tuned model weights (optional)
        """
        self.model_path = model_path
        self.model = None
        self.device = None
        self.class_names = None
        self.transform = None
        
        if TORCH_AVAILABLE:
            self._initialize_model()
        else:
            print("Warning: PyTorch not available. Using mock classifier.")
    
    def _initialize_model(self):
        """Initialize PyTorch model"""
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Load pre-trained ResNet18
        self.model = models.resnet18(pretrained=True)
        
        # Modify for food classification (assuming 1000 common food classes)
        num_classes = 1000
        self.model.fc = torch.nn.Linear(self.model.fc.in_features, num_classes)
        
        # Load custom weights if provided
        if self.model_path and os.path.exists(self.model_path):
            try:
                self.model.load_state_dict(torch.load(self.model_path, map_location=self.device))
                print(f"Loaded model from {self.model_path}")
            except Exception as e:
                print(f"Warning: Could not load model from {self.model_path}: {e}")
        
        self.model.to(self.device)
        self.model.eval()
        
        # Image preprocessing
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # Load class names (placeholder - should be loaded from actual dataset)
        self.class_names = self._load_class_names()
    
    def _load_class_names(self) -> list:
        """Load food class names"""
        # Placeholder - in production, load from actual food dataset
        food_classes = [
            'apple', 'banana', 'orange', 'chicken', 'rice', 'pasta', 'bread',
            'broccoli', 'carrot', 'potato', 'tomato', 'cheese', 'milk',
            'egg', 'fish', 'beef', 'salad', 'pizza', 'burger', 'sandwich',
            'french_fries', 'donut', 'cake', 'cookie', 'ice_cream', 'yogurt',
            'coffee', 'tea', 'juice', 'soda', 'water', 'beer', 'wine'
        ]
        return food_classes
    
    def predict(self, image_path: str) -> Tuple[str, float]:
        """
        Predict food class from image
        
        Args:
            image_path: Path to food image
            
        Returns:
            Tuple of (predicted_class, confidence)
        """
        if not TORCH_AVAILABLE:
            return self._mock_predict(image_path)
        
        try:
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Make prediction
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = torch.nn.functional.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
            
            class_idx = predicted.item()
            class_name = self.class_names[class_idx] if class_idx < len(self.class_names) else f"class_{class_idx}"
            confidence_score = confidence.item()
            
            return class_name, confidence_score
            
        except Exception as e:
            print(f"Error during prediction: {e}")
            return "unknown", 0.0
    
    def _mock_predict(self, image_path: str) -> Tuple[str, float]:
        """Mock prediction for testing without PyTorch"""
        import random
        food_classes = ['apple', 'banana', 'chicken', 'rice', 'salad', 'pizza', 'burger']
        predicted_class = random.choice(food_classes)
        confidence = round(random.uniform(0.7, 0.99), 3)
        return predicted_class, confidence
    
    def predict_batch(self, image_paths: list) -> list:
        """
        Predict multiple images
        
        Args:
            image_paths: List of paths to images
            
        Returns:
            List of (class, confidence) tuples
        """
        results = []
        for image_path in image_paths:
            result = self.predict(image_path)
            results.append(result)
        return results


# Singleton instance
_classifier_instance = None


def get_food_classifier(model_path: Optional[str] = None) -> FoodClassifier:
    """Get or create food classifier instance"""
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = FoodClassifier(model_path)
    return _classifier_instance
