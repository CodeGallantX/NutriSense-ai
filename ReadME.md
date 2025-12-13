# NutriSense AI – Smart Nutrition Guidance for Everyone  
### Built at the Building in Lagos Impact Hackathon

## 🌍 Overview
**NutriSense AI** is a digital nutrition assistant designed to help individuals make healthier, more affordable, and culturally relevant food choices. Our solution uses artificial intelligence to provide personalized nutrition guidance aligned with key Sustainable Development Goals.

**Live Deployment:**
- **Frontend:** https://nutri-sense-ai-eight.vercel.app
- **Backend API:** https://nutrisense-ai-y5xx.onrender.com

---

## 🎯 Mission
NutriSense AI makes healthy eating accessible to everyone by focusing on:

- **SDG 3 – Good Health and Well-Being:**  
  Supporting everyday nutrition with personalized, non-diagnostic nutrition insights.

- **SDG 12 – Responsible Consumption and Production:**  
  Promoting affordable meal planning, reduced waste, and smarter food choices.

---

## 🧠 Features

### 📸 AI Food Image Analysis
- **YOLOv8 Food Detection**: Real-time food item detection from images using optimized ONNX model
- **Mistral AI Validation**: Advanced vision AI validates and extends detected food items
- **Instant Nutritional Insights**: Automatic calorie, macronutrient, and micronutrient analysis
- **Glycemic Index Tracking**: Diabetes-friendly food scoring and recommendations

### 🍽 AI Meal Recommendations
- Suggests balanced meals based on:
  - Budget  
  - Lifestyle  
  - Local food availability  
  - Cultural preferences  

### ❤️ Special Dietary Support *(Non-diagnostic)*
Provides general nutrition guidance for users with:
- **Diabetes management**: Glycemic index tracking, sugar monitoring, carb optimization
- **Hypertension care**: Sodium reduction, potassium-rich alternatives
- **Ulcer management**: Low-acid, easily digestible food suggestions
- **Weight management**: Calorie tracking, portion control, macro balancing

> NutriSense AI does **not** diagnose medical conditions. It encourages safer habits and healthier awareness.

### 🔍 Eating Pattern & Nutritional Gap Analysis
- Identifies food patterns through image analysis
- Estimates nutritional gaps based on meal history
- Recommends healthier, accessible alternatives  
- Suggests portions and nutrient balance improvements
- Tracks daily/weekly nutrition trends

### 💸 Budget-Friendly Planning
- Generates cost-effective meal options  
- Encourages lower waste through smart ingredient use
- Local food price optimization

---

## 🛠 Technical Architecture

### Backend (FastAPI + Python)
- **Framework**: FastAPI with async support
- **AI Models**:
  - YOLOv8 (ONNX optimized for CPU inference)
  - Mistral AI Vision API integration
- **Data**: 760+ food items with comprehensive nutrition profiles
- **Health Rules Engine**: Condition-specific dietary recommendations
- **Deployment**: Render (Cloud hosting with auto-scaling)

### Frontend (Next.js + React)
- **Framework**: Next.js 14 with App Router
- **UI Components**: Shadcn/ui with Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Deployment**: Vercel (Edge network)

### Key Technologies
- **Computer Vision**: YOLOv8, OpenCV, PIL
- **AI/ML**: Mistral AI, Torch, Transformers
- **Backend**: FastAPI, Pydantic, Python-dotenv
- **Frontend**: TypeScript, React, Next.js, Lucide Icons
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (Image hosting)

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/meet-tola/NutriSense-ai.git
   cd NutriSense-ai/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your MISTRAL_API_KEY
   ```

5. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   API will be available at: http://localhost:8000

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add:
   # NEXT_PUBLIC_BACKEND_API=http://localhost:8000
   # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at: http://localhost:3000

---

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

### Food Detection
```bash
POST /scan-food/
Content-Type: multipart/form-data

Parameters:
- file: Image file (PNG, JPG)
- diabetes: boolean (optional)
- hypertension: boolean (optional)
- ulcer: boolean (optional)
- weight_loss: boolean (optional)
```

### Meal Analysis
```bash
POST /analyze-meal
Content-Type: multipart/form-data

Parameters:
- file: Image file
- diabetes: boolean
- hypertension: boolean
- ulcer: boolean
- weight_loss: boolean

Returns: Comprehensive nutrition analysis with health recommendations
```

For complete API documentation, visit: http://localhost:8000/docs

---

## 🗂 Project Structure

```
NutriSense-ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── yolo.py              # YOLO food detection
│   │   ├── mistral.py           # Mistral AI integration
│   │   ├── fusion.py            # Detection fusion logic
│   │   ├── heuristics.py        # Health rules engine
│   │   ├── data/
│   │   │   ├── nutrition_db.json      # Curated nutrition data
│   │   │   ├── glycemic_index.json    # GI values
│   │   │   └── foods_extended.json    # 760+ food items
│   │   └── ml_models/
│   │       └── yolo/best.onnx   # YOLO model
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── (auth)/              # Authentication pages
    │   ├── (dashboard)/         # Dashboard pages
    │   │   ├── analyzer/        # Food analyzer
    │   │   ├── dashboard/       # Main dashboard
    │   │   ├── health-diary/    # Health tracking
    │   │   └── meal-planner/    # Meal planning
    │   └── onboarding/          # User onboarding
    ├── components/
    │   ├── analyzer-modal.tsx   # Food scan modal
    │   ├── navbar.tsx           # Navigation
    │   └── ui/                  # UI components
    └── package.json
```

---

## 🔧 Configuration

### Environment Variables

**Backend (.env):**
```env
MISTRAL_API_KEY=your_mistral_api_key_here
YOLO_MODEL_PATH=app/ml_models/yolo/best.onnx
YOLO_IMGSZ=320
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_BACKEND_API=https://nutrisense-ai-y5xx.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest test_integration.py
```

### Test Food Detection
```bash
curl -X POST "http://localhost:8000/scan-food/" \
  -F "file=@test_image.jpg" \
  -F "diabetes=true"
```

---

## 🛠 How It Works

1. **Image Upload:**  
   User captures or uploads food image through the web interface

2. **AI Detection:**  
   - YOLOv8 detects food items in the image (320x320 optimized for CPU)
   - Mistral AI validates and extends detections with confidence scoring

3. **Nutrition Analysis:**  
   - System looks up nutrition data from 760+ food database
   - Calculates total calories, macros, micronutrients, and glycemic load

4. **Health Recommendations:**  
   - Heuristics engine applies condition-specific rules
   - Generates personalized warnings and suggestions
   - Provides healthier alternatives

5. **Personalized Output:**  
   Clear meal breakdown, health insights, actionable recommendations, and habit-building tips

---

## � Food Database

The system includes a comprehensive nutrition database with:
- **760+ Food Items**: Extensive coverage of local and international foods
- **Complete Nutrition Profiles**: Calories, macros, micronutrients, fiber
- **Glycemic Index Data**: Diabetes-friendly scoring for all items
- **Local Food Mapping**: African and culturally relevant food items

Database files:
- `nutrition_db.json`: 20 curated high-quality entries
- `glycemic_index.json`: GI values and classifications
- `foods_extended.json`: 760+ comprehensive food database

---

## 🔒 Security & Privacy

- **Secure API Communication**: CORS-enabled with origin validation
- **Image Processing**: Images processed server-side, not stored permanently
- **No PHI Storage**: Health conditions used only for session-based recommendations
- **Environment Security**: API keys managed through environment variables
- **HTTPS Encryption**: All production traffic encrypted

---

## 🚢 Deployment

### Backend (Render)
```bash
# render.yaml is configured for automatic deployment
# Environment variables set in Render dashboard
```

### Frontend (Vercel)
```bash
# Automatic deployment from main branch
# Environment variables set in Vercel dashboard
vercel --prod
```

---

## 🐛 Troubleshooting

### Backend Issues
- **YOLO loading slow**: First request may take 10-15s as model loads
- **Mistral API errors**: Verify MISTRAL_API_KEY is set correctly
- **CORS errors**: Check allow_origin_regex in main.py

### Frontend Issues
- **API connection failed**: Verify NEXT_PUBLIC_BACKEND_API is set
- **Image upload errors**: Check file size (max 5MB) and format (PNG, JPG)
- **Build errors**: Run `npm install` to ensure all dependencies are installed

---

## 📚 Documentation

### API Documentation
- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI when running locally)
- **Production API**: [https://nutrisense-ai-y5xx.onrender.com/docs](https://nutrisense-ai-y5xx.onrender.com/docs)

### Backend Documentation
- **Implementation Summary**: [backend/docs/IMPLEMENTATION_SUMMARY.md](backend/docs/IMPLEMENTATION_SUMMARY.md) - Complete backend architecture and features
- **Roadmap**: [backend/docs/ROADMAP.md](backend/docs/ROADMAP.md) - Future enhancements and development plans
- **Mistral AI Integration**: [backend/docs/MISTRAL_INTEGRATION.md](backend/docs/MISTRAL_INTEGRATION.md) - Vision API setup and usage
- **YOLO + DeepSeek Guide**: [backend/docs/YOLO_DEEPSEEK_README.md](backend/docs/YOLO_DEEPSEEK_README.md) - Food detection model details
- **ONNX Implementation**: [backend/docs/ONNX_IMPLEMENTATION_COMPLETE.md](backend/docs/ONNX_IMPLEMENTATION_COMPLETE.md) - CPU-optimized inference guide
- **ONNX Caching Reference**: [backend/docs/ONNX_CACHING_QUICK_REFERENCE.md](backend/docs/ONNX_CACHING_QUICK_REFERENCE.md) - Performance optimization
- **Bug Fix: YOLO Input Size**: [backend/docs/BUGFIX_YOLO_INPUT_SIZE.md](backend/docs/BUGFIX_YOLO_INPUT_SIZE.md) - Resolved 320→640 issue

### Frontend Documentation
- **Frontend README**: [frontend/README.md](frontend/README.md) - Next.js app setup and components

### Deployment Configuration
- **Render Deployment**: [backend/render.yaml](backend/render.yaml) - Backend hosting configuration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👥 Team

Developed collaboratively during the **Building in Lagos Impact Hackathon**.

**Core Contributors:**
- Project Lead & Developer: meet-tola

---

## 🚀 Vision

To scale NutriSense AI into a widely accessible platform that improves nutritional health across Africa by combining AI, local food intelligence, and human-centered design.

**Future Enhancements:**
- Multi-language support (Yoruba, Igbo, Hausa, etc.)
- Offline mode with local processing
- Nutrition tracking analytics dashboard
- Recipe recommendations based on available ingredients
- Community meal sharing and reviews
- Integration with fitness trackers
- SMS-based interface for low-bandwidth areas

---

## 📄 License

This project is open for use, modification, and contribution under the **MIT License**.

---

## 🙏 Acknowledgments

- **Building in Lagos** for hosting the Impact Hackathon
- **Mistral AI** for providing vision API access
- **Ultralytics** for YOLOv8 model architecture
- **Supabase** for backend infrastructure
- **Vercel** and **Render** for hosting platforms

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/meet-tola/NutriSense-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/meet-tola/NutriSense-ai/discussions)

---

**Built with ❤️ for a healthier Africa**

