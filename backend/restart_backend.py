#!/usr/bin/env python3
"""
Quick script to restart the backend
"""
import subprocess
import sys
import time
import requests

def restart_backend():
    print("🔄 Restarting backend...")
    
    # Kill any existing process on port 8000
    try:
        subprocess.run(["taskkill", "/F", "/IM", "python.exe"], 
                      capture_output=True, check=False)
        print("✅ Stopped existing backend processes")
    except:
        pass
    
    time.sleep(2)
    
    # Start the backend
    print("🚀 Starting backend...")
    process = subprocess.Popen([sys.executable, "main.py"], 
                              stdout=subprocess.PIPE, 
                              stderr=subprocess.PIPE)
    
    # Wait a moment for startup
    time.sleep(5)
    
    # Test if it's running
    try:
        response = requests.get("http://localhost:8000/image-generator/health")
        if response.status_code == 200:
            print("✅ Backend is running and healthy!")
            return True
        else:
            print(f"⚠️  Backend responding but status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not responding: {e}")
        return False

if __name__ == "__main__":
    restart_backend()
