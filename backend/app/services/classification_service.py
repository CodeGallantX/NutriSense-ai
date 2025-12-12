from transformers import AutoFeatureExtractor, AutoModelForImageClassification, pipeline
from PIL import Image
from pathlib import Path

# Load HF model once
MODEL_NAME = "nateraw/food"  # Hugging Face model
_model = None
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = pipeline("image-classification", model=MODEL_NAME, top_k=5)  # top 5 predictions
    return _pipeline

def classify_food(image: Image.Image):
    pipe = get_pipeline()
    results = pipe(image)
    # results = [{"label": ..., "score": ...}, ...]
    return results
