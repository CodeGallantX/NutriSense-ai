#!/usr/bin/env python3
"""Quick import test"""
try:
    from app.main import app
    print("SUCCESS: All imports work correctly!")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
