#!/bin/bash

# Face Recognition Backend Setup Script

echo "🚀 Setting up Face Recognition Backend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✅ Python 3 found"

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p face_data
mkdir -p encodings

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the server, run:"
echo "  source venv/bin/activate"
echo "  python app.py"
echo ""
echo "The API will be available at http://localhost:5000"
echo ""
echo "📚 API Endpoints:"
echo "  POST /api/register-face - Register a user with 4 biometric faces"
echo "  POST /api/recognize-face - Recognize a user from a single face image"
echo "  GET  /api/users - Get list of registered users"
echo "  GET  /api/health - Health check"
