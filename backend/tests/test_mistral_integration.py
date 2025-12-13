"""
Test Mistral Integration
Validates the YOLO + Mistral food detection pipeline
"""
import os
import sys
import requests
from pathlib import Path
from PIL import Image

# Test configuration
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")
TEST_IMAGES_DIR = Path(__file__).parent / "test_images"

def test_mistral_endpoint():
    """Test the /scan-food-yolo-mistral/ endpoint."""
    print("=" * 60)
    print("MISTRAL INTEGRATION TEST")
    print("=" * 60)
    
    # Check if test images exist
    if not TEST_IMAGES_DIR.exists():
        print(f"⚠️  Test images directory not found: {TEST_IMAGES_DIR}")
        print("   Creating directory... Please add test images.")
        TEST_IMAGES_DIR.mkdir(exist_ok=True)
        return False
    
    # Find test images
    test_images = list(TEST_IMAGES_DIR.glob("*.jpg")) + list(TEST_IMAGES_DIR.glob("*.png"))
    
    if not test_images:
        print(f"  No test images found in: {TEST_IMAGES_DIR}")
        print("   Please add some food images (.jpg or .png) to test.")
        return False
    
    print(f"\n Found {len(test_images)} test image(s)")
    
    # Test each image
    results = []
    for image_path in test_images[:3]:  # Test first 3 images
        print(f"\n{'─' * 60}")
        print(f"Testing: {image_path.name}")
        print(f"{'─' * 60}")
        
        try:
            # Check image is valid
            img = Image.open(image_path)
            print(f"Image loaded: {img.size}, mode: {img.mode}")
            
            # Call API
            endpoint = f"{API_BASE_URL}/scan-food-yolo-mistral/"
            print(f" Calling: {endpoint}")
            
            with open(image_path, "rb") as f:
                response = requests.post(
                    endpoint,
                    files={"file": f},
                    timeout=30
                )
            
            # Check response
            if response.status_code == 200:
                data = response.json()
                
                print(f"API Response: {response.status_code}")
                print(f"\n RESULTS:")
                print(f"   Detected Items: {len(data['detected_items'])}")
                
                # Display detected foods
                for item in data['detected_items']:
                    print(f"   • {item['name']} ({item['source']}) - confidence: {item['confidence']:.2f}")
                
                # Display meal summary
                summary = data['meal_summary']
                print(f"\n MEAL SUMMARY:")
                print(f"   Quality: {summary['quality']} (score: {summary['score']:.1f})")
                print(f"   Calories: {summary['total_calories']:.0f} kcal")
                print(f"   Carbs: {summary['total_carbs']:.1f}g")
                print(f"   Protein: {summary['total_protein']:.1f}g")
                print(f"   Fiber: {summary['total_fiber']:.1f}g")
                print(f"   Glycemic Load: {summary['glycemic_load']:.1f}")
                
                # Display fusion stats
                stats = data['fusion_stats']
                print(f"\n FUSION STATS:")
                print(f"   Total Items: {stats['total_items']}")
                print(f"   YOLO Items: {stats['yolo_items']}")
                print(f"   LLM Items: {stats['llm_items']}")
                print(f"   Avg Confidence: {stats['average_confidence']:.3f}")
                
                results.append({
                    "image": image_path.name,
                    "status": "PASS",
                    "items": len(data['detected_items'])
                })
                
            else:
                print(f"❌ API Error: {response.status_code}")
                print(f"   {response.text}")
                results.append({
                    "image": image_path.name,
                    "status": "FAIL",
                    "error": response.status_code
                })
                
        except Exception as e:
            print(f"❌ Test failed: {e}")
            results.append({
                "image": image_path.name,
                "status": "ERROR",
                "error": str(e)
            })
    
    # Print summary
    print(f"\n{'=' * 60}")
    print("TEST SUMMARY")
    print(f"{'=' * 60}")
    
    passed = sum(1 for r in results if r['status'] == 'PASS')
    failed = sum(1 for r in results if r['status'] in ['FAIL', 'ERROR'])
    
    for result in results:
        status_icon = "✅" if result['status'] == 'PASS' else "❌"
        print(f"{status_icon} {result['image']}: {result['status']}")
        if result['status'] == 'PASS':
            print(f"   Detected {result['items']} food items")
        elif 'error' in result:
            print(f"   Error: {result['error']}")
    
    print(f"\n📊 Total: {passed} passed, {failed} failed")
    
    return passed > 0 and failed == 0


def test_mistral_module():
    """Test the Mistral module directly."""
    print("\n" + "=" * 60)
    print("MISTRAL MODULE TEST (Direct)")
    print("=" * 60)
    
    try:
        from app.mistral import MistralFoodValidator
        from PIL import Image
        
        # Check API key
        if not os.getenv("MISTRAL_API_KEY"):
            print("⚠️  MISTRAL_API_KEY not set")
            print("   Set with: export MISTRAL_API_KEY='your-key'")
            return False
        
        print("✅ MISTRAL_API_KEY found")
        
        # Initialize validator
        validator = MistralFoodValidator()
        print(f"✅ Validator initialized: model={validator.model}")
        
        # Find a test image
        test_images = list(TEST_IMAGES_DIR.glob("*.jpg")) + list(TEST_IMAGES_DIR.glob("*.png"))
        if not test_images:
            print("⚠️  No test images found")
            return False
        
        test_image = test_images[0]
        print(f"\n📷 Testing with: {test_image.name}")
        
        # Load image
        image = Image.open(test_image)
        
        # Mock YOLO detections
        yolo_detections = [
            {"name": "rice", "confidence": 0.85, "source": "YOLO"},
            {"name": "chicken", "confidence": 0.78, "source": "YOLO"}
        ]
        
        print(f"🎯 YOLO detections: {[d['name'] for d in yolo_detections]}")
        
        # Call Mistral
        print("🔄 Calling Mistral API...")
        results = validator.validate_detections(image, yolo_detections)
        
        print(f"✅ Mistral returned {len(results)} items")
        for item in results:
            print(f"   • {item['name']} - confidence: {item['confidence']:.2f}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("   Run from backend directory: python test_mistral_integration.py")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def check_environment():
    """Check environment setup."""
    print("=" * 60)
    print("ENVIRONMENT CHECK")
    print("=" * 60)
    
    checks = []
    
    # Check MISTRAL_API_KEY
    api_key = os.getenv("MISTRAL_API_KEY")
    if api_key:
        print(f"✅ MISTRAL_API_KEY set ({api_key[:10]}...)")
        checks.append(True)
    else:
        print("❌ MISTRAL_API_KEY not set")
        print("   Set with: export MISTRAL_API_KEY='your-key'")
        checks.append(False)
    
    # Check API server
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print(f"✅ API server running at {API_BASE_URL}")
            checks.append(True)
        else:
            print(f"⚠️  API server returned {response.status_code}")
            checks.append(False)
    except Exception as e:
        print(f"❌ API server not reachable: {e}")
        print(f"   Start with: uvicorn app.main:app --reload")
        checks.append(False)
    
    # Check test images
    if TEST_IMAGES_DIR.exists():
        image_count = len(list(TEST_IMAGES_DIR.glob("*.jpg")) + list(TEST_IMAGES_DIR.glob("*.png")))
        if image_count > 0:
            print(f"✅ Test images found: {image_count} files")
            checks.append(True)
        else:
            print(f"⚠️  No test images in {TEST_IMAGES_DIR}")
            checks.append(False)
    else:
        print(f"❌ Test images directory not found: {TEST_IMAGES_DIR}")
        checks.append(False)
    
    print(f"\n📊 Environment: {sum(checks)}/{len(checks)} checks passed")
    return all(checks)


def main():
    """Run all tests."""
    print("\n🚀 MISTRAL INTEGRATION TEST SUITE\n")
    
    # Check environment first
    env_ok = check_environment()
    
    if not env_ok:
        print("\n⚠️  Environment check failed. Please fix issues and try again.")
        return 1
    
    print("\n" + "=" * 60)
    print("RUNNING TESTS...")
    print("=" * 60)
    
    # Run tests
    test_results = []
    
    # Test 1: API endpoint
    try:
        result = test_mistral_endpoint()
        test_results.append(("API Endpoint", result))
    except Exception as e:
        print(f"❌ API test crashed: {e}")
        test_results.append(("API Endpoint", False))
    
    # Test 2: Direct module (optional)
    # try:
    #     result = test_mistral_module()
    #     test_results.append(("Direct Module", result))
    # except Exception as e:
    #     print(f"⚠️  Direct module test skipped: {e}")
    
    # Final summary
    print("\n" + "=" * 60)
    print("FINAL RESULTS")
    print("=" * 60)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    all_passed = all(result for _, result in test_results)
    
    if all_passed:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n❌ Some tests failed. Check logs above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
