# YOLO + DeepSeek-VL2 Food Detection API

## Overview

This implementation provides a robust food detection API that combines:
- **YOLO** (YOLOv8 ONNX) - High-precision anchor detection
- **DeepSeek-VL2** (Small) - Complementary vision-language model for missed items
- **Heuristics** - Rich nutrition data, glycemic load, and health recommendations

## Architecture

### Detection Flow

```
Image Input
    ↓
1. YOLO Detection (Trusted Anchor)
    ↓
2. DeepSeek-VL2 Detection (Gap Filler)
    ↓
3. Fusion: YOLO ∪ (DeepSeek - YOLO)
    ↓
4. Heuristics: Nutrition + Flags + Glycemic
    ↓
5. Meal Summary: Scores + Recommendations
    ↓
JSON Response
```

### Key Principles

1. **YOLO is Truth**: All YOLO detections are kept (high precision)
2. **DeepSeek Fills Gaps**: Only adds items missed by YOLO (no overrides)
3. **Deterministic**: Strict prompting prevents hallucinations
4. **Heuristic Enhancement**: Rich nutrition data from local databases

## API Endpoint

### POST `/scan-food-yolo-deepseek/`

**Input:**
- `file`: Food image (multipart/form-data)

**Output:**
```json
{
  "detected_items": [
    {
      "name": "jollof rice",
      "confidence": 0.87,
      "source": "yolo",
      "calories": 180,
      "carbs": 35,
      "protein": 4,
      "fat": 3,
      "fiber": 1,
      "glycemic_index": 72,
      "flags": ["carb-heavy", "starchy"],
      "warnings": {
        "diabetes": "High GI; portion control.",
        "hypertension": "Watch salt/oil."
      },
      "portion_advice": "High GI - limit portion for blood sugar control"
    }
  ],
  "meal_summary": {
    "item_count": 3,
    "total_calories": 650,
    "total_carbs": 85,
    "total_protein": 35,
    "total_fat": 18,
    "total_fiber": 4,
    "glycemic_load": 58,
    "score": 72.3,
    "quality": "Good",
    "components": {
      "meal_diversity": 75,
      "nutrient_completeness": 70,
      "glycemic_load_score": 68,
      "fiber_adequacy": 50,
      "protein_adequacy": 85,
      "fat_quality": 70,
      "sodium_penalty": 75,
      "diabetes_friendly": 65
    },
    "recommendations": [
      "Increase fiber - add leafy greens or whole grains",
      "Reduce carb-heavy items or add low-GI alternatives"
    ],
    "warnings": [
      "⚠️ High glycemic load - monitor blood sugar"
    ]
  },
  "recommendations": {
    "healthy_alternatives": [
      "Replace with boiled or boli (roasted) plantain (~40% fewer calories)"
    ],
    "portion_adjustments": [
      "Reduce jollof rice portion by 30-40% (high GI)"
    ],
    "additions": [
      "Add leafy greens (spinach, kale) for fiber and minerals",
      "Add vegetable salad or steamed vegetables"
    ]
  },
  "fusion_stats": {
    "total_items": 3,
    "yolo_items": 2,
    "deepseek_items": 1,
    "average_confidence": 0.82
  }
}
```

## Module Breakdown

### 1. `app/yolo.py` - YOLO Detection
- Loads YOLOv8 ONNX model from `ml_models/yolo/best.onnx`
- Returns food detections with bounding boxes and confidence
- Fast CPU inference with ONNX Runtime

### 2. `app/deepseek.py` - DeepSeek-VL2 Integration
- Uses `deepseek-ai/deepseek-vl2-small` from HuggingFace
- Strict prompt to prevent hallucinations:
  ```
  TASK: Identify every real, visible food item in the image ONLY.
  RULES: No guessing, no description, no sentences. Only list foods present.
  OUTPUT: Comma-separated lowercase list, e.g. rice, beans, chicken. If none, return "none".
  ```
- Returns additional food items with confidence estimation

### 3. `app/fusion.py` - Detection Fusion
- Combines YOLO and DeepSeek results
- Deduplication using name similarity (Jaccard)
- YOLO results always kept; DeepSeek fills gaps only
- Configurable confidence thresholds

### 4. `app/heuristics.py` - Nutrition & Scoring
- Loads nutrition data from `data/nutrition_db.json`
- Loads glycemic index from `data/glycemic_index.json`
- Calculates:
  - Individual food nutrition (calories, macros, fiber, GI)
  - Flags (fried, carb-heavy, spicy, etc.)
  - Meal-level scores (diversity, completeness, GL, etc.)
  - Health warnings and recommendations
  - Portion advice based on GI and composition

### 5. `app/models.py` - Pydantic Schemas
- `FoodDetection`: Individual food item with enriched data
- `MealSummary`: Aggregated nutrition and scores
- `MealRecommendations`: Actionable suggestions
- `ScanFoodResponse`: Complete API response
- `ErrorResponse`: Structured error messages

## Installation

### Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Key Requirements:**
- `torch>=2.0.0` - PyTorch for DeepSeek
- `transformers>=4.40.0` - HuggingFace Transformers
- `ultralytics>=8.0.0` - YOLOv8
- `fastapi>=0.100.0` - Web framework
- `pillow>=10.0.0` - Image processing
- `accelerate` - Faster model loading
- `sentencepiece` - Tokenization
- `einops` - Tensor operations
- `timm` - Vision models

### Model Downloads

On first run, models will be automatically downloaded:
- **YOLO**: Already present at `ml_models/yolo/best.onnx` (~6MB)
- **DeepSeek-VL2**: Downloaded from HuggingFace (~2GB)
  - Cached in `$HF_HOME` or `~/.cache/huggingface/`

## Running Locally

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Visit:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Testing the Endpoint

### Using cURL

```bash
curl -X POST "http://localhost:8000/scan-food-yolo-deepseek/" \
  -F "file=@path/to/food_image.jpg"
```

### Using Python

```python
import requests

url = "http://localhost:8000/scan-food-yolo-deepseek/"
files = {"file": open("food_image.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```

### Using Swagger UI

1. Open http://localhost:8000/docs
2. Find `/scan-food-yolo-deepseek/` endpoint
3. Click "Try it out"
4. Upload an image
5. Click "Execute"

## Deployment on Render

### Configuration

The `render.yaml` is already configured:

```yaml
services:
  - type: web
    name: nutrisense-api
    env: python
    plan: starter  # Upgrade to 4GB+ for better performance
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: HF_TOKEN
        fromService: secret  # For DeepSeek model access
      - key: TRANSFORMERS_CACHE
        value: "/tmp/huggingface_cache"
```

### Steps

1. Push code to GitHub
2. Connect repository to Render
3. Set `HF_TOKEN` environment variable (optional, for private models)
4. Deploy
5. First request will be slow (model download ~2-3GB)
6. Subsequent requests use cached models

### Performance Notes

- **Starter plan**: May be tight on memory (512MB)
- **Recommended**: 4GB+ RAM for DeepSeek-VL2
- **YOLO**: Fast on CPU (ONNX optimized)
- **DeepSeek**: Slower on CPU, much faster on GPU
- **Cold start**: ~30-60s (model loading)
- **Warm requests**: ~2-5s (YOLO) + ~10-20s (DeepSeek on CPU)

## Optimization Tips

### 1. Disable DeepSeek for Faster Responses
If you only need YOLO:
```python
# In app/main.py scan_food_yolo_deepseek()
# Comment out DeepSeek detection step
```

### 2. Cache Models Properly
Set environment variables:
```bash
export TRANSFORMERS_CACHE=/path/to/cache
export HF_HOME=/path/to/cache
```

### 3. Use GPU (if available)
DeepSeek will automatically use CUDA if available:
```python
# In app/deepseek.py
device = "cuda" if torch.cuda.is_available() else "cpu"
```

### 4. Adjust Confidence Thresholds
In fusion:
```python
# Higher threshold = fewer false positives
fusion_engine = DetectionFusion(deepseek_confidence_threshold=0.5)
```

## Error Handling

The API provides structured error responses:

- **400**: Invalid image format
- **404**: No foods detected
- **500**: Server error (model loading failed, etc.)

Example error:
```json
{
  "detail": "No foods detected in image. Please try a clearer image with visible food items."
}
```

## Extending the System

### Add New Foods

1. Update `data/nutrition_db.json`:
```json
{
  "New Food Name": {
    "calories": 200,
    "carbs": 30,
    "protein": 10,
    "fat": 5,
    "fiber": 3,
    "flags": ["carb-heavy"],
    "warnings": {...}
  }
}
```

2. Update `data/glycemic_index.json`:
```json
{
  "New Food Name": 55
}
```

### Train New YOLO Model

1. Collect and label food images
2. Train YOLOv8 model
3. Export to ONNX:
```python
from ultralytics import YOLO
model = YOLO('best.pt')
model.export(format='onnx')
```
4. Replace `ml_models/yolo/best.onnx`

### Use Different VLM

Replace DeepSeek with another vision-language model:
```python
# In app/deepseek.py
model_name = "llava-hf/llava-1.5-7b-hf"  # Example
```

## Monitoring & Logging

Logs are written to stdout:
```
2025-12-12 10:30:45 - app.yolo - INFO - YOLO detected 2 items: ['rice', 'chicken']
2025-12-12 10:30:50 - app.deepseek - INFO - DeepSeek detected 1 items: ['salad']
2025-12-12 10:30:51 - app.fusion - INFO - Fusion complete: 3 total items
```

Enable debug logging:
```python
logging.basicConfig(level=logging.DEBUG)
```

## Troubleshooting

### Issue: "No foods detected"
- **Cause**: Poor image quality or no recognizable foods
- **Fix**: Try clearer image with good lighting

### Issue: DeepSeek fails to load
- **Cause**: Insufficient memory or network issues
- **Fix**: System will gracefully fall back to YOLO-only mode

### Issue: Slow first request
- **Cause**: Model download (2-3GB)
- **Fix**: Wait for download to complete; subsequent requests are faster

### Issue: YOLO model not found
- **Cause**: `best.onnx` missing
- **Fix**: Ensure YOLO model exists at `ml_models/yolo/best.onnx`

## License

Ensure compliance with:
- YOLO: AGPL-3.0 (or commercial license)
- DeepSeek-VL2: Check model license on HuggingFace
- Your application: Choose appropriate license

## Support

- GitHub Issues: [NutriSense-ai/issues](https://github.com/meet-tola/NutriSense-ai/issues)
- Documentation: See `/docs` endpoint
- Contact: NutriSense Team

## Roadmap

- [ ] Add batch processing support
- [ ] Implement model caching strategies
- [ ] Add more VLM options (LLaVA, GPT-4V)
- [ ] Support for ingredient-level detection
- [ ] Multi-language support for food names
- [ ] Real-time streaming detection
- [ ] Mobile-optimized lightweight models

---

**Built with ❤️ by NutriSense Team**
