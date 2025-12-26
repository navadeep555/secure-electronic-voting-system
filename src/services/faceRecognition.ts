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
