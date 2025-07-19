#!/usr/bin/env python3
"""
Flask Backend Startup Script for Synergy AI
This script starts the Flask server with proper configuration.
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed."""
    required_packages = [
        'flask',
        'flask-cors',
        'numpy',
        'pandas',
        'scikit-learn'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing required packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 Install missing packages with:")
        print("   pip install -r requirements.txt")
        return False
    
    print("✅ All required packages are installed")
    return True

def start_server():
    """Start the Flask server."""
    print("🚀 Starting Synergy AI Flask Backend...")
    print("📍 Server will be available at: http://localhost:5000")
    print("📊 API Documentation: http://localhost:5000/api/health")
    print("\n" + "="*50)
    
    try:
        # Import and run the Flask app
        from app import app
        
        # Set environment variables
        os.environ['FLASK_ENV'] = 'development'
        os.environ['FLASK_DEBUG'] = '1'
        
        # Start the server
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=True
        )
        
    except ImportError as e:
        print(f"❌ Error importing Flask app: {e}")
        print("Make sure you're in the Backend directory and app.py exists")
        return False
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False

def main():
    """Main function."""
    print("🎯 Synergy AI - Flask Backend Startup")
    print("="*50)
    
    # Check if we're in the right directory
    if not Path('app.py').exists():
        print("❌ app.py not found in current directory")
        print("Please run this script from the Backend directory")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    print("\n🔧 Starting server...")
    start_server()

if __name__ == "__main__":
    main()