# Developer Setup & Workflow Guide

Heyteam! Here strictly steps to get this project running on your machine and how to push your changes.

## 🚀 Part 1: First Time Setup

Follow these steps exactly when you first download the project.

### 1. Install Tools (If you haven't already)
-   **Node.js**: [Download Here](https://nodejs.org/) (Install the LTS version)
-   **Python**: [Download Here](https://www.python.org/)
-   **Git**: [Download Here](https://git-scm.com/)

### 2. Get the Code
Open your terminal (Command Prompt or Terminal) and run:
```bash
git clone https://github.com/navadeep555/secure-electronic-voting-system.git
cd secure-electronic-voting-system
```

### 3. Install Dependencies
You need to install libraries for both the website (frontend) and the server (backend).

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
pip install flask flask-cors face_recognition numpy pillow cmake dlib
```
*(If `pip` doesn't work, try `pip3`)*

---

## 🏃‍♂️ Part 2: How to Run the App

You need to run **two** things at the same time. Open **two separate terminal windows**.

**Terminal 1 (Backend Server):**
```bash
python backend/app.py
```
*Wait until you see "Server running on http://localhost:5001"*

**Terminal 2 (Frontend Website):**
```bash
npm run dev
```
*Wait until you see "Local: http://localhost:5173"*

👉 **Now open your browser and go to:** `http://localhost:5173`

---

## 💻 Part 3: Making & Pushing Changes

So you made some changes to the code? Here is how to save them and send them to GitHub so everyone else can see them.

### 1. Check what you changed
```bash
git status
```
*This shows you which files you modified.*

### 2. Stage your changes
To prepare **all** your changes for saving:
```bash
git add .
```

### 3. Save (Commit) your changes
Give a message describing what you did:
```bash
git commit -m "Fixed the camera bug"
```
*(Replace "Fixed the camera bug" with whatever you actually did)*

### 4. Pull latest changes (Important!)
Before pushing, always check if someone else updated the code to avoid conflicts:
```bash
git pull origin main
```

### 5. Push your changes
Send your code to GitHub:
```bash
git push origin main
```

---

## 🆘 Common Issues

-   **"Port already in use"**: This means the server is already running appropriately. Close the other terminal or press `Ctrl + C` to stop it.
-   **`npm` or `python` command not found**: You didn't install Node.js or Python properly. Re-install them.
-   **Camera not working**: Make sure you allowed browser permissions and your room is well-lit!
