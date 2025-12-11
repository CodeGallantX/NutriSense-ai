"""
Blood Sugar Spike Risk Predictor
Fine-tuned neural network for predicting post-meal blood sugar spikes
"""
import os
from typing import Optional, Tuple
import numpy as np
from pathlib import Path

try:
    import torch
    import torch.nn as nn
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


class SpikePredictor(nn.Module):
    """Neural network for blood sugar spike prediction"""
    
    def __init__(self, input_size: int = 10):
        """
        Initialize spike predictor network
        
        Args:
            input_size: Number of input features
        """
        super(SpikePredictor, self).__init__()
        
        self.fc1 = nn.Linear(input_size, 64)
        self.bn1 = nn.BatchNorm1d(64)
        self.dropout1 = nn.Dropout(0.3)
        
        self.fc2 = nn.Linear(64, 32)
        self.bn2 = nn.BatchNorm1d(32)
        self.dropout2 = nn.Dropout(0.3)
        
        self.fc3 = nn.Linear(32, 16)
        self.fc4 = nn.Linear(16, 1)  # Predict spike magnitude
        
        self.relu = nn.ReLU()
    
    def forward(self, x):
        """Forward pass"""
        x = self.fc1(x)
        x = self.bn1(x)
        x = self.relu(x)
        x = self.dropout1(x)
        
        x = self.fc2(x)
        x = self.bn2(x)
        x = self.relu(x)
        x = self.dropout2(x)
        
        x = self.fc3(x)
        x = self.relu(x)
        
        x = self.fc4(x)
        x = torch.abs(x)  # Ensure positive spike prediction
        
        return x


class BloodSugarSpikePredictorModel:
    """
    Blood sugar spike predictor wrapper
    Predicts post-meal blood sugar spikes based on meal composition and user profile
    """
    
    # Feature indices
    FEATURES = [
        'carbs_g', 'protein_g', 'fat_g', 'fiber_g',
        'glycemic_load', 'sugar_g', 'age', 'weight_kg', 'activity_level', 'diabetes_type'
    ]
    
    def __init__(self, model_path: Optional[str] = None):
        """
        Initialize the spike predictor
        
        Args:
            model_path: Path to pre-trained model weights
        """
        self.model = None
        self.model_path = model_path
        self.device = None
        self.is_trained = False
        
        if TORCH_AVAILABLE:
            self._initialize_model()
        else:
            print("Warning: PyTorch not available. Using heuristic predictor.")
    
    def _initialize_model(self):
        """Initialize PyTorch model"""
        try:
            self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
            self.model = SpikePredictor(input_size=len(self.FEATURES))
            
            if self.model_path and os.path.exists(self.model_path):
                try:
                    checkpoint = torch.load(self.model_path, map_location=self.device)
                    self.model.load_state_dict(checkpoint)
                    self.is_trained = True
                    print(f"Loaded trained model from {self.model_path}")
                except Exception as e:
                    print(f"Warning: Could not load model: {e}")
                    self.is_trained = False
            
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            print(f"Error initializing model: {e}")
            self.model = None
    
    def predict(
        self,
        carbs_g: float,
        protein_g: float,
        fat_g: float,
        fiber_g: float,
        glycemic_load: float,
        sugar_g: Optional[float] = None,
        age: Optional[int] = None,
        weight_kg: Optional[float] = None,
        activity_level: Optional[str] = None,
        diabetes_type: Optional[str] = None
    ) -> Tuple[float, Optional[float], str]:
        """
        Predict blood sugar spike
        
        Args:
            carbs_g: Carbohydrates in grams
            protein_g: Protein in grams
            fat_g: Fat in grams
            fiber_g: Fiber in grams
            glycemic_load: Glycemic Load
            sugar_g: Sugar in grams (optional)
            age: Age in years (optional)
            weight_kg: Weight in kg (optional)
            activity_level: Activity level (optional)
            diabetes_type: Type 1, Type 2, etc. (optional)
            
        Returns:
            Tuple of (predicted_spike_mg_dl, confidence, risk_level)
        """
        if TORCH_AVAILABLE and self.model is not None and self.is_trained:
            return self._neural_predict(
                carbs_g, protein_g, fat_g, fiber_g, glycemic_load,
                sugar_g, age, weight_kg, activity_level, diabetes_type
            )
        else:
            return self._heuristic_predict(
                carbs_g, protein_g, fat_g, fiber_g, glycemic_load,
                sugar_g, age, weight_kg, activity_level, diabetes_type
            )
    
    def _neural_predict(
        self,
        carbs_g: float,
        protein_g: float,
        fat_g: float,
        fiber_g: float,
        glycemic_load: float,
        sugar_g: Optional[float] = None,
        age: Optional[int] = None,
        weight_kg: Optional[float] = None,
        activity_level: Optional[str] = None,
        diabetes_type: Optional[str] = None
    ) -> Tuple[float, Optional[float], str]:
        """Predict using neural network"""
        try:
            # Prepare features
            features = self._prepare_features(
                carbs_g, protein_g, fat_g, fiber_g, glycemic_load,
                sugar_g, age, weight_kg, activity_level, diabetes_type
            )
            
            # Convert to tensor
            feature_tensor = torch.FloatTensor([features]).to(self.device)
            
            # Get prediction
            with torch.no_grad():
                prediction = self.model(feature_tensor)
                spike_mg_dl = float(prediction.item())
            
            # Calculate confidence (optional - could be based on uncertainty)
            confidence = 0.75
            
            # Determine risk level
            risk_level = self._determine_risk_level(spike_mg_dl)
            
            return spike_mg_dl, confidence, risk_level
            
        except Exception as e:
            print(f"Error in neural prediction: {e}")
            return self._heuristic_predict(
                carbs_g, protein_g, fat_g, fiber_g, glycemic_load,
                sugar_g, age, weight_kg, activity_level, diabetes_type
            )
    
    def _heuristic_predict(
        self,
        carbs_g: float,
        protein_g: float,
        fat_g: float,
        fiber_g: float,
        glycemic_load: float,
        sugar_g: Optional[float] = None,
        age: Optional[int] = None,
        weight_kg: Optional[float] = None,
        activity_level: Optional[str] = None,
        diabetes_type: Optional[str] = None
    ) -> Tuple[float, Optional[float], str]:
        """Predict using heuristic rules"""
        
        # Base spike on glycemic load
        spike = glycemic_load * 2.5
        
        # Reduce by fiber
        spike = max(0, spike - (fiber_g * 2))
        
        # Reduce by fat and protein (slow digestion)
        spike = max(0, spike - ((fat_g + protein_g) * 0.3))
        
        # Increase by sugar content
        if sugar_g:
            spike += sugar_g * 0.5
        
        # Adjust for diabetes type
        if diabetes_type and diabetes_type.lower() == 'type 1':
            spike *= 1.2  # Type 1 tends to have more dramatic spikes
        
        # Adjust for activity level
        if activity_level:
            activity_multipliers = {
                'sedentary': 1.3,
                'light': 1.1,
                'moderate': 1.0,
                'vigorous': 0.8,
                'very_vigorous': 0.7
            }
            spike *= activity_multipliers.get(activity_level.lower(), 1.0)
        
        # Cap spike at reasonable maximum
        spike = min(spike, 150)
        spike = max(spike, 0)
        
        risk_level = self._determine_risk_level(spike)
        
        return round(spike, 1), None, risk_level
    
    def _prepare_features(
        self,
        carbs_g: float,
        protein_g: float,
        fat_g: float,
        fiber_g: float,
        glycemic_load: float,
        sugar_g: Optional[float] = None,
        age: Optional[int] = None,
        weight_kg: Optional[float] = None,
        activity_level: Optional[str] = None,
        diabetes_type: Optional[str] = None
    ) -> list:
        """Prepare features for model input"""
        
        # Normalize features
        features = [
            carbs_g / 100,  # Normalize carbs
            protein_g / 50,  # Normalize protein
            fat_g / 50,      # Normalize fat
            fiber_g / 20,    # Normalize fiber
            glycemic_load / 50,  # Normalize GL
            (sugar_g or 0) / 50,  # Normalize sugar
            (age or 40) / 80,     # Normalize age
            (weight_kg or 70) / 150,  # Normalize weight
            self._encode_activity_level(activity_level),  # One-hot encoding
            self._encode_diabetes_type(diabetes_type)     # One-hot encoding
        ]
        
        return features
    
    @staticmethod
    def _encode_activity_level(activity_level: Optional[str]) -> float:
        """Encode activity level as numeric value"""
        encoding = {
            'sedentary': 0.2,
            'light': 0.4,
            'moderate': 0.6,
            'vigorous': 0.8,
            'very_vigorous': 1.0
        }
        return encoding.get((activity_level or 'moderate').lower(), 0.6)
    
    @staticmethod
    def _encode_diabetes_type(diabetes_type: Optional[str]) -> float:
        """Encode diabetes type as numeric value"""
        encoding = {
            'type 1': 0.8,
            'type 2': 0.5,
            'gestational': 0.4,
            'prediabetes': 0.3
        }
        return encoding.get((diabetes_type or 'type 2').lower(), 0.5)
    
    @staticmethod
    def _determine_risk_level(spike_mg_dl: float) -> str:
        """Determine risk level based on spike magnitude"""
        if spike_mg_dl <= 30:
            return 'low'
        elif spike_mg_dl <= 60:
            return 'moderate'
        else:
            return 'high'


# Singleton instance
_predictor_instance = None


def get_spike_predictor(model_path: Optional[str] = None) -> BloodSugarSpikePredictorModel:
    """Get or create spike predictor instance"""
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = BloodSugarSpikePredictorModel(model_path)
    return _predictor_instance
