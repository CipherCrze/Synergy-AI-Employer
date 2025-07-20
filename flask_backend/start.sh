#!/bin/bash

# Synergy AI Flask Backend Startup Script

echo "Starting Synergy AI Flask Backend..."

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export PYTHONPATH=/app/flask_backend

# Navigate to backend directory
cd /app/flask_backend

# Install any missing dependencies
pip install -r requirements.txt

# Start the Flask application
python app.py