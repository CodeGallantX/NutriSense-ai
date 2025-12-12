# ONNX & Model Caching - Quick Reference

## TL;DR

✅ **ONNX model is cached correctly. No changes needed.**

- YOLO loads **once at server startup** (`@app.on_event("startup")`)
- Cached as **global singleton** (`_yolo_detector`)
- Reused across **all requests** (no re-initialization)
- Ultralytics **auto-handles** ONNX session caching
- Memory footprint: **constant ~150MB** (no leaks)

---

## How to Verify (Production Monitoring)

### 1. Check Startup Logs

```bash
# On Render, check logs during deployment
Startup: Preloading YOLO model...
Loading YOLO model from: /app/app/ml_models/yolo/best.onnx
YOLO model loaded successfully (ONNX session cached)
Startup: Models ready
```

**✅ Good:** Model loads once at startup

### 2. Check Request Logs

All three endpoints should log the **same singleton**:

```bash
# Request 1
get_yolo_detector() → returns cached instance
YOLO detected 3 food items

# Request 2 (different image)
get_yolo_detector() → returns SAME cached instance (not reloaded!)
YOLO detected 2 food items

# Request 3
get_yolo_detector() → returns SAME cached instance
YOLO detected 4 food items
```

**✅ Good:** Same instance reused (no memory growth)

### 3. Monitor Memory Usage

```bash
# On Render dashboard
Initial: ~500MB (Python + FastAPI + deps)
After startup: ~650MB (+ 150MB for YOLO)
After 100 requests: ~650MB (flat, no growth)
```

**✅ Good:** Memory flat after startup (no leaks)

**❌ Bad signs:**
- Memory grows with each request (leak!)
- Model loads multiple times in logs (reinit!)
- Slow responses after startup (cold start)

---

## What NOT to Do

### ❌ DO NOT reload the model in endpoints

```python
# WRONG (don't do this!)
@app.post("/scan-food/")
async def scan_food(file: UploadFile):
    yolo = YOLO("best.onnx")  # ❌ Creates new ONNX session every request!
    return yolo.predict(image)
```

### ❌ DO NOT create multiple detector instances

```python
# WRONG (don't do this!)
detector1 = YOLOFoodDetector()  # ❌ Instance #1
detector2 = YOLOFoodDetector()  # ❌ Instance #2 (memory doubles!)
```

### ❌ DO NOT skip the startup preload

```python
# WRONG (don't skip this!)
@app.on_event("startup")
def preload_models():
    # ❌ Missing this causes slow first request (2-3s cold start)
    pass
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│ FastAPI Server (main.py)                                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Startup (@app.on_event("startup"))                    │
│  ├─ get_yolo_detector()                                │
│  │  └─ YOLOFoodDetector() [load ONNX session once]    │
│  │     └─ _yolo_detector = <cached instance>           │
│  │                                                      │
│  Request 1: /scan-food-yolo-mistral/                  │
│  ├─ get_yolo_detector() → _yolo_detector (cached)     │
│  ├─ predict(image) → reuse ONNX session                │
│  └─ return results                                     │
│                                                         │
│  Request 2: /scan-food/                               │
│  ├─ get_yolo_detector() → _yolo_detector (cached)     │
│  ├─ predict(image) → reuse ONNX session                │
│  └─ return results                                     │
│                                                         │
│  Request 3: /analyze-meal                             │
│  ├─ get_yolo_detector() → _yolo_detector (cached)     │
│  ├─ predict(image) → reuse ONNX session                │
│  └─ return results                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘

Memory Impact:
  Startup:     +150MB (ONNX session)
  Request 1:   +0MB   (reuse)
  Request 2:   +0MB   (reuse)
  Request 3:   +0MB   (reuse)
  Total:       150MB  (constant)
```

---

## Files Involved

| File | Role | Key Code |
|------|------|----------|
| `main.py` | FastAPI app | Global `_yolo_detector` + `get_yolo_detector()` + `@app.on_event("startup")` |
| `yolo.py` | Model wrapper | `YOLOFoodDetector` class + `predict()` reuse |
| `mistral.py` | LLM validation | No ONNX (uses Mistral API) |
| `fusion.py` | Detection merge | No ONNX (pure Python logic) |
| `heuristics.py` | Nutrition logic | No ONNX (pure Python logic) |

---

## Deployment Checklist

- [x] YOLO model file exists: `/app/ml_models/yolo/best.onnx`
- [x] YAML config exists: `/app/ml_models/yolo/chownet_data.yaml`
- [x] `onnxruntime` installed in `requirements.txt` ✅
- [x] `ultralytics` installed in `requirements.txt` ✅
- [x] Startup preload enabled ✅
- [x] Singleton getter implemented ✅
- [x] Multiple instance detection safeguard added ✅
- [x] Memory monitoring ready ✅

---

## If Something Goes Wrong

### Symptom: Memory grows with each request

```
Initial: 650MB
After 10 requests: 800MB
After 100 requests: 2GB (OOM!)
```

**Cause:** Model reloading per request

**Fix:** Ensure `get_yolo_detector()` is used in all endpoints, not direct `YOLO()` creation

**Check logs:** Look for multiple "Loading YOLO model" messages

### Symptom: First request takes 2-3 seconds

```
Request 1: 2500ms
Request 2: 85ms
Request 3: 82ms
```

**Cause:** Missing startup preload (model loads on first request)

**Fix:** Ensure `@app.on_event("startup")` is calling `get_yolo_detector()`

**Check logs:** Look for "Startup: Preloading YOLO model" at server start

### Symptom: Multiple ONNX sessions detected in memory profiler

```
onnxruntime.InferenceSession #1: 150MB
onnxruntime.InferenceSession #2: 150MB
onnxruntime.InferenceSession #3: 150MB
```

**Cause:** Multiple YOLOFoodDetector instances created

**Fix:** Check for accidental instance creation outside singleton

**Check logs:** Look for warning: "⚠️ MULTIPLE YOLO INSTANCES DETECTED"

---

## Performance Benchmarks (Expected)

| Operation | CPU (Render) | GPU (if available) |
|-----------|---|---|
| Startup (load model) | ~2 seconds | ~1 second |
| First inference | <150ms | <50ms |
| Subsequent inferences | <100ms | <30ms |
| Memory per instance | ~150MB | ~300MB |

---

## Questions?

Refer to `ONNX_CACHING_STRATEGY.md` for deep technical details.

Contact the backend team if you see memory leaks or slow startup.
