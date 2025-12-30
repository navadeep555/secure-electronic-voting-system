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
