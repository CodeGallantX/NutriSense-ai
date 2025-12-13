# NutriSense AI - Balanced Diet Analysis Roadmap

## ✅ Implemented (Current MVP)

### Basic Food Detection & Analysis
- YOLO-based object detection for Nigerian foods
- HuggingFace classifier fallback for undetected items
- Complete nutrition database (calories, carbs, protein, fat, fiber)
- Glycemic Index database with 20 foods
- Personalized health advice (diabetes, hypertension, ulcer, weight loss)

### Meal-Level Analysis
- **Meal aggregation**: Total calories, macros, glycemic load
- **Balanced meal scoring**: 0-100 score based on macro balance
- **Smart recommendations**: Protein/carb/fiber suggestions
- **Health-specific warnings**: GI load, sodium, etc.

### Response Format
```json
{
  "detected_items": [
    {
      "name": "Jollof Rice",
      "confidence": 0.87,
      "source": "YOLO",
      "calories": 180,
      "carbs": 35,
      "protein": 4,
      "fat": 3,
      "fiber": 1,
      "glycemic_index": 72,
      "advice": "High GI – minimize for diabetes ⚠️"
    }
  ],
  "meal_summary": {
    "total_calories": 350,
    "total_carbs": 50,
    "total_protein": 15,
    "total_fat": 10,
    "total_fiber": 5,
    "glycemic_load": 18,
    "score": 75,
    "quality": "Good",
    "recommendations": ["Add more vegetables for fiber"],
    "warnings": ["ℹ️ Moderate glycemic load"]
  }
}
```

---

## 🚀 Phase 1: Enhanced Detection (Next Sprint)

### 1. Upgrade to YOLOv8 Segmentation
**Goal**: Detect multiple food items on a single plate with pixel-level masks

**Implementation**:
```python
from ultralytics import YOLO

# Load segmentation model instead of detection
model = YOLO("yolov8n-seg.pt")  # or train custom model

# Get segmentation masks
results = model.predict(img)
for r in results:
    masks = r.masks  # Segmentation masks
    boxes = r.boxes  # Bounding boxes
    
    # Each mask represents a separate food item
    for i, (mask, box) in enumerate(zip(masks, boxes)):
        # Extract region for secondary analysis
        cropped = extract_region(img, mask)
```

**Benefits**:
- Detect overlapping foods (e.g., rice under chicken)
- More accurate portion estimation via pixel count
- Better separation of mixed plates

**Training Data Needed**:
- Annotate Chownet images with segmentation masks using tools like LabelMe or CVAT
- ~500-1000 images with pixel-level annotations

---

### 2. Hierarchical Classification
**Goal**: Identify small/ambiguous components missed by primary detector

**Flow**:
```
Image → YOLO Detection → Extract Crops → HF Classifier → Merge Results
```

**Implementation**:
```python
def hierarchical_classify(img, yolo_results):
    items = []
    
    # Primary detection
    for box in yolo_results.boxes:
        crop = img.crop(box.xyxy)
        
        # If low confidence, run secondary classifier
        if box.conf < 0.6:
            classifier_result = classify_food(crop)
            # Merge results with confidence weighting
            
    return items
```

**Use Cases**:
- Small garnishes (herbs, vegetables)
- Sauces and condiments
- Mixed dishes (stew with multiple ingredients)

---

### 3. Portion Size Estimation
**Goal**: Weight detections by size for accurate calorie counts

**Approach**:
```python
def estimate_portion(mask_area, food_name):
    # Reference: standard serving = X pixels at standard distance
    REFERENCE_SIZES = {
        "Jollof Rice": 5000,  # pixels for 1 cup
        "Fried Chicken": 3000  # pixels for 1 piece
    }
    
    ref_size = REFERENCE_SIZES.get(food_name, 4000)
    portion_ratio = mask_area / ref_size
    
    return portion_ratio  # 1.0 = standard serving
```

**Nutrition Adjustment**:
```python
calories = base_calories * portion_ratio
carbs = base_carbs * portion_ratio
```

---

## 🎯 Phase 2: Intelligent Nutrition Estimation

### 4. Missing Ingredient Heuristics
**Goal**: Fill gaps for undetected components

**Strategy**:
```python
MEAL_TEMPLATES = {
    "Jollof Rice": {
        "typical_sides": ["Fried Plantain", "Vegetable Salad"],
        "avg_protein": 5,  # if no protein detected
        "avg_fiber": 2
    }
}

def estimate_missing_nutrition(detected_foods):
    # If only carbs detected, suggest typical protein
    if has_only_carbs(detected_foods):
        add_estimated_protein(detected_foods)
```

---

### 5. Glycemic Load Calculator
**Already Implemented!** ✅

Current formula: `GL = (GI × carbs) / 100`

**Enhancement**: Add meal timing recommendations
```python
if gl > 20:
    recommendations.append("Pair with protein/fat to slow absorption")
    recommendations.append("Consider eating vegetables first")
```

---

## 📊 Phase 3: User Interaction & Refinement

### 6. User Confirmation Flow
**Goal**: Let users tag/correct detections

**API Endpoint**:
```python
@app.post("/confirm-detection/")
def confirm_detection(
    session_id: str,
    corrections: List[dict]  # [{"detected": "X", "actual": "Y"}]
):
    # Store corrections for model improvement
    # Return updated nutrition
```

**Frontend Flow**:
1. Show detected items with confidence scores
2. Allow user to tap and correct
3. Recalculate nutrition instantly

---

### 7. Multi-Image Meal Tracking
**Goal**: Track full day's meals for comprehensive analysis

**DB Schema**:
```python
meals = {
    "user_id": "abc123",
    "date": "2025-12-12",
    "meals": [
        {"type": "breakfast", "items": [...], "totals": {...}},
        {"type": "lunch", "items": [...], "totals": {...}},
        {"type": "dinner", "items": [...], "totals": {...}}
    ],
    "daily_totals": {...}
}
```

---

## 🔬 Phase 4: Advanced Analysis

### 8. Nutrient Density Score
**Formula**: `nutrients_per_calorie`

```python
def nutrient_density(food):
    score = (protein * 4 + fiber * 5 + vitamins) / calories
    return score
```

---

### 9. Recipe Suggestions
**Goal**: Suggest balanced alternatives

```python
if meal_score < 50:
    suggestions = [
        "Swap fried plantain → Steamed vegetables (+30 score)",
        "Add grilled fish → +15g protein"
    ]
```

---

## 📈 Model Training Roadmap

### Immediate (Week 1-2)
- [x] Populate nutrition DB with 20 foods
- [x] Implement meal scoring
- [ ] Collect 100 test images
- [ ] Test current model accuracy

### Short-term (Month 1)
- [ ] Fine-tune YOLOv8 on Chownet dataset
- [ ] Add 50 more Nigerian foods to DB
- [ ] Implement portion estimation (v1)

### Mid-term (Month 2-3)
- [ ] Train YOLOv8-seg with segmentation masks
- [ ] Implement hierarchical classification
- [ ] Add user correction pipeline

### Long-term (Month 4+)
- [ ] Multi-meal tracking dashboard
- [ ] Recipe recommendation engine
- [ ] Integration with wearables (blood glucose)

---

## 🛠️ Technical Requirements

### For Segmentation Model
```bash
pip install ultralytics>=8.0.0
# Train segmentation model
yolo segment train data=chownet_seg.yaml model=yolov8n-seg.pt epochs=100
```

### For Portion Estimation
- Camera calibration data (focal length, distance)
- Reference objects (plate size, utensil dimensions)
- Or: depth camera (iPhone LiDAR, RealSense)

### For User Tracking
- Database (Supabase, Firebase)
- User authentication
- Meal history API

---

## 📝 Next Steps

1. **Test Current System**
   - Upload 20 test images
   - Measure detection accuracy
   - Identify failure cases

2. **Prioritize Improvements**
   - Highest impact: Segmentation model
   - Quick win: Portion estimation heuristics
   - Long-term: User tracking

3. **Collect Feedback**
   - Deploy MVP to 10 test users
   - Track most-requested features
   - Iterate on meal scoring algorithm

---

## 🎓 Resources

- [YOLOv8 Segmentation Docs](https://docs.ultralytics.com/tasks/segment/)
- [Chownet Dataset](https://github.com/Chownet/food-recognition)
- [Glycemic Load Calculator](https://glycemicindex.com/)
- [LabelMe Annotation Tool](https://github.com/wkentaro/labelme)
