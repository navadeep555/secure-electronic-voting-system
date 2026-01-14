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

# Create sample user data
echo "📝 Creating sample user data..."
cat > users.json << END
{
  "users": [
    {
      "id": "USER001",
      "name": "Demo User",
      "email": "demo@securevote.com",
      "role": "voter",
      "status": "verified",
      "aadhaar": "1234 5678 9012"
    }
  ]
}
END

# Create backup script
echo "🛡️ Creating backup script..."
cat > backup_users.sh << 'BACKUP'
#!/bin/bash
timestamp=$(date +%Y%m%d_%H%M%S)
cp encodings/face_encodings.pkl "encodings/backup_${timestamp}.pkl" 2>/dev/null || echo "No encodings to backup"
if [ -f users.json ]; then
    cp users.json "users_backup_${timestamp}.json"
fi
echo "✅ Backup complete: ${timestamp}"
BACKUP
chmod +x backup_users.sh

echo ""
echo "✅ Setup complete!"
