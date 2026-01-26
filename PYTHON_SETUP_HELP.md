# 🛠️ Troubleshooting Python Setup on macOS

## Quick Diagnosis

Run this first:
```bash
python3 --version
pip3 --version
which cmake
```

---

## Issue: Python 3 Not Found

### Solution:
```bash
# Install Python 3 using Homebrew
brew install python3

# Verify installation
python3 --version
```

---

## Issue: Command Not Found (after running setup.sh)

### Solution:
```bash
# Make sure you're in the backend directory
cd backend

# Manually activate virtual environment
source venv/bin/activate

# You should see (venv) prefix in terminal now
```

---

## Issue: "pip install" fails with permission error

### Solution:
```bash
# Never use sudo with pip. Instead:

# 1. Activate virtual environment
source venv/bin/activate

# 2. Upgrade pip
pip install --upgrade pip

# 3. Install requirements
pip install -r requirements.txt
```

---

## Issue: dlib compilation fails

dlib requires C++ compiler and cmake.

### Solution:

```bash
# 1. Install build tools
xcode-select --install

# 2. Install cmake
brew install cmake

# 3. Reinstall face_recognition
pip uninstall face-recognition
pip install face-recognition
```

If that fails, try:
```bash
# Install Xcode command line tools completely
sudo xcode-select --reset
xcode-select --install
```

---

## Issue: "face_recognition module not found"

### Solution:
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Verify installation
python3 -c "import face_recognition; print('✅ Installed!')"

# If not found, reinstall
pip install face-recognition
```

---

## Issue: Flask not running on port 5000

### Solution:

```bash
# Check if port is in use
lsof -i :5000

# If yes, kill the process
kill -9 <PID>

# Or use different port - edit backend/app.py:
# Change: app.run(debug=True, port=5000)
# To:     app.run(debug=True, port=5001)
```

---

## Issue: Camera permission denied

### Solution:
1. **macOS System Settings** → **Privacy & Security** → **Camera**
2. Allow **"Google Chrome"** (or your browser)
3. Reload the page

---

## Full Manual Setup (If setup.sh fails)

```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python3 -m venv venv

# 3. Activate virtual environment
source venv/bin/activate

# 4. Upgrade pip
pip install --upgrade pip

# 5. Install requirements one by one
pip install Flask==2.3.3
pip install Flask-CORS==4.0.0
pip install Pillow==10.0.0
pip install numpy==1.24.3
pip install opencv-python==4.8.0.76
pip install python-dotenv==1.0.0

# 6. Install face-recognition (most complex)
pip install face-recognition==1.4.0

# 7. Create directories
mkdir -p face_data
mkdir -p encodings

# 8. Test installation
python3 -c "import face_recognition; print('✅ All installed!')"

# 9. Start server
python app.py
```

---

## Verify Everything Works

Run this test script:

```bash
# Activate environment
source venv/bin/activate

# Create test_setup.py
cat > test_setup.py << 'EOF'
#!/usr/bin/env python3

import sys
print("Python version:", sys.version)

# Test imports
try:
    import flask
    print("✅ Flask installed")
except ImportError:
    print("❌ Flask NOT installed")

try:
    import face_recognition
    print("✅ face_recognition installed")
except ImportError:
    print("❌ face_recognition NOT installed")

try:
    import cv2
    print("✅ opencv-python installed")
except ImportError:
    print("❌ opencv-python NOT installed")

try:
    import numpy
    print("✅ numpy installed")
except ImportError:
    print("❌ numpy NOT installed")

try:
    import PIL
    print("✅ Pillow installed")
except ImportError:
    print("❌ Pillow NOT installed")

print("\n✅ All dependencies OK!" if all([
    'Flask' in sys.modules,
    'face_recognition' in sys.modules,
]) else "\n⚠️ Some dependencies missing")
EOF

# Run test
python3 test_setup.py
```

---

## Issue: "ModuleNotFoundError: No module named 'dlib'"

face_recognition depends on dlib. If installation fails:

### Solution:

```bash
# 1. Make sure you have cmake
brew install cmake

# 2. Install Visual C++ Build Tools (if on M1 Mac)
brew install gcc

# 3. Try installing dlib directly
pip install dlib-19.24.2

# 4. Then install face_recognition
pip install face-recognition
```

---

## M1/M2 Mac Special Instructions

If you have Apple Silicon (M1/M2/M3):

```bash
# 1. Install Homebrew packages for ARM
arch -arm64 brew install cmake

# 2. Set environment for Python
export ARCHFLAGS=-Wno-error=unused-command-line-argument-hard-error-in-future

# 3. Install dependencies
pip install numpy
pip install Pillow
pip install opencv-python
pip install flask

# 4. Install dlib (might take 5-10 minutes)
pip install dlib-19.24.2 --no-cache-dir

# 5. Install face-recognition
pip install face-recognition
```

---

## Final Checklist

Before running `python app.py`, verify:

```bash
source venv/bin/activate

# Check each command works
python3 --version              # Should show Python 3.8+
pip --version                 # Should show pip version
python -c "import flask"      # Should have no error
python -c "import face_recognition"  # Should have no error
ls encodings/                 # Should show directory exists
ls face_data/                 # Should show directory exists
```

If all ✅, then:
```bash
python app.py
```

You should see:
```
🚀 Starting Face Recognition Server...
📍 Server running on http://localhost:5000
```

---

## Still Having Issues?

### Check logs for details:
```bash
# Run with verbose output
python -v app.py 2>&1 | head -100
```

### Try minimal test:
```bash
# Create simple_test.py
cat > simple_test.py << 'EOF'
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

if __name__ == '__main__':
    app.run(debug=True, port=5000)
EOF

# Run it
python simple_test.py
```

If this works, the issue is with face_recognition dependencies.

---

## Nuclear Option: Fresh Start

If nothing works:

```bash
# 1. Remove virtual environment
rm -rf venv

# 2. Remove any cache
pip cache purge

# 3. Start fresh
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 4. If face-recognition still fails, use Conda instead:
# brew install miniconda
# conda create -n face_env python=3.9
# conda activate face_env
# pip install -r requirements.txt
```

---

## Get Help

If stuck:
1. Read full error message carefully
2. Google the error (usually has solution on StackOverflow)
3. Check Python version: `python3 --version`
4. Check pip packages: `pip list | grep -E "face|dlib|flask|opencv"`
5. Try on different Python version: `brew install python@3.10`

---

**Remember**: Most issues are due to:
1. Wrong Python version
2. Not activating virtual environment
3. Missing cmake/build tools on M1 Mac
4. Port 5000 already in use

Good luck! 🚀
