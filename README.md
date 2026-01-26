# SecureVote Identity

SecureVote Identity is a secure, biometric-enabled identity verification system for voting applications. It leverages modern web technologies and AI-powered face recognition to ensure authentic and seamless user registration.

## Features

-   **Biometric Registration**: Multi-angle face capture (Front, Left, Right, Up) using AI detection.
-   **Liveness Detection**: Real-time pose estimation and lighting checks to prevent spoofing.
-   **Document Verification**: Integrated upload and preview for Aadhaar and Voter ID cards.
-   **Secure Backend**: Python Flask backend with `face_recognition` library for generating and matching facial encodings.
-   **Modern UI**: Built with React, TypeScript, and Tailwind CSS for a responsive and accessible experience.

## Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion
-   **AI/ML (Frontend)**: `face-api.js` for real-time browser-based face detection and landmarking.
-   **Backend**: Python, Flask
-   **AI/ML (Backend)**: `face_recognition`, `dlib`, `numpy` for secure server-side verification.

## Prerequisites

-   Node.js (v18 or higher)
-   Python (v3.8 or higher)
-   Git

## Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/navadeep555/secure-electronic-voting-system.git
    cd secure-electronic-voting-system
    ```

2.  **Frontend Setup:**
    ```bash
    npm install
    ```

3.  **Backend Setup:**
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: Ensure you have `cmake` installed if you face issues installing `dlib`)*

## Running the Application

1.  **Start the Backend Server:**
    Open a terminal and run:
    ```bash
    python backend/app.py
    ```
    The server will start on `http://localhost:5001`.

2.  **Start the Frontend Application:**
    Open a new terminal window and run:
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:5173`.

## Usage

1.  Navigate to the registration page.
2.  Enter your personal details (Name, DOB, Aadhaar, etc.).
3.  Upload your Aadhaar and Voter ID documents.
4.  Complete the 4-stage biometric face capture process by following the on-screen instructions.
5.  Submit your registration!
