import * as faceapi from 'face-api.js'

// face-api.js model loading state
let modelsLoaded = false

// Load face-api.js models
export async function loadFaceApiModels(): Promise<boolean> {
    if (modelsLoaded) return true

    try {
        console.log('Loading face-api.js models...')

        const MODEL_URL = '/models'

        await Promise.all([
            faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        ])

        modelsLoaded = true
        console.log('✅ face-api.js models loaded successfully')
        return true
    } catch (error) {
        console.error('❌ Failed to load face-api.js models:', error)
        return false
    }
}

// Detect face landmarks on video stream
export async function detectFaceLandmarks(
    video: HTMLVideoElement
): Promise<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }> | null> {
    try {
        if (!modelsLoaded) {
            await loadFaceApiModels()
        }

        const detection = await faceapi
            .detectSingleFace(video, new faceapi.SsdMobilenetv1Options())
            .withFaceLandmarks()

        return detection || null
    } catch (error) {
        console.error('Face landmark detection error:', error)
        return null
    }
}

// Analyze head pose from landmarks
export function analyzeHeadPose(landmarks: faceapi.FaceLandmarks68): {
    direction: 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN'
    confidence: number
} {
    const nose = landmarks.getNose()
    const leftEye = landmarks.getLeftEye()
    const rightEye = landmarks.getRightEye()
    const mouth = landmarks.getMouth()

    // Calculate face center
    const faceCenter = {
        x: (leftEye[0].x + rightEye[3].x) / 2,
        y: (leftEye[0].y + rightEye[3].y) / 2
    }

    // Calculate nose position relative to face center
    const noseX = nose[3].x - faceCenter.x
    const noseY = nose[3].y - faceCenter.y

    // Determine direction based on nose position
    const threshold = 15

    if (Math.abs(noseX) < threshold && Math.abs(noseY) < threshold) {
        return { direction: 'CENTER', confidence: 0.9 }
    } else if (noseX < -threshold) {
        return { direction: 'LEFT', confidence: 0.8 }
    } else if (noseX > threshold) {
        return { direction: 'RIGHT', confidence: 0.8 }
    } else if (noseY < -threshold) {
        return { direction: 'UP', confidence: 0.8 }
    } else {
        return { direction: 'DOWN', confidence: 0.7 }
    }
}

// Basic TypeScript interfaces for face data
export interface FaceData {
    image: string
    timestamp: number
}

export interface CameraConfig {
    width: number
    height: number
    facingMode: 'user' | 'environment'
}

// Start camera function
export async function startCamera(videoElement: HTMLVideoElement): Promise<MediaStream> {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: 640, height: 480 }
        })

        videoElement.srcObject = stream
        return stream
    } catch (error) {
        console.error('Failed to start camera:', error)
        throw new Error('Camera access denied')
    }
}

// Stop camera function
export function stopCamera(stream: MediaStream | null) {
    if (stream) {
        stream.getTracks().forEach(track => track.stop())
    }
}

// Verify document function
export async function verifyDocument(
    imageBase64: string,
    onLoading?: (loading: boolean) => void,
    onSuccess?: (message: string) => void,
    onError?: (error: string) => void
): Promise<{
    success: boolean
    text?: string
    cleaned_text?: string
    dob?: string
    keywords_validated?: boolean
    message?: string
    error?: string
}> {
    try {
        // Set loading state
        if (onLoading) onLoading(true)

        const response = await fetch('http://localhost:5001/api/verify_document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageBase64 })
        })

        const data = await response.json()

        // Clear loading state
        if (onLoading) onLoading(false)

        if (!response.ok) {
            const errorMsg = data.error || 'Document verification failed'
            if (onError) onError(errorMsg)
            throw new Error(errorMsg)
        }

        // Success message handling
        if (onSuccess && data.message) {
            onSuccess(data.message)
        }

        return data
    } catch (error) {
        // Clear loading state
        if (onLoading) onLoading(false)

        console.error('Document verification error:', error)
        const errorMsg = error instanceof Error ? error.message : 'Failed to verify document'

        // Error message handling
        if (onError) onError(errorMsg)

        return {
            success: false,
            error: errorMsg
        }
    }
}
