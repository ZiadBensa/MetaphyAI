#!/usr/bin/env python3
"""
Install required dependencies for local image generation
"""
import subprocess
import sys

def install_package(package):
    """Install a package using pip"""
    try:
        print(f"Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    """Install all required packages"""
    print("📦 Installing Local Image Generation Dependencies")
    print("=" * 50)
    
    packages = [
        "diffusers",
        "transformers", 
        "accelerate",
        "pillow",
        "safetensors",
        "huggingface_hub"
    ]
    
    success_count = 0
    for package in packages:
        if install_package(package):
            success_count += 1
    
    print(f"\n📊 Installation Summary:")
    print(f"✅ Successfully installed: {success_count}/{len(packages)} packages")
    
    if success_count == len(packages):
        print("\n🎉 All dependencies installed successfully!")
        print("You can now run the backend with local image generation.")
    else:
        print("\n⚠️  Some packages failed to install.")
        print("Please check your internet connection and try again.")

if __name__ == "__main__":
    main()
