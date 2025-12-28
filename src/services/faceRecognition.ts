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
export async function verifyDocument(imageBase64: string): Promise<{
    success: boolean
    text?: string
    message?: string
    error?: string
}> {
    try {
        const response = await fetch('http://localhost:5001/api/verify_document', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imageBase64 })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Document verification failed')
        }

        return data
    } catch (error) {
        console.error('Document verification error:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to verify document'
        }
    }
}
