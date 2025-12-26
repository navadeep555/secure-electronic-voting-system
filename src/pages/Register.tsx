import { useRef, useState } from 'react'

export default function Register() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState<string>('')

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 }
            })

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream
            }

            setStream(mediaStream)
            setCameraError('')
        } catch (error) {
            console.error('Camera access error:', error)
            setCameraError('Unable to access camera. Please grant permission.')
        }
    }

    return (
        <div className="register-container">
            <h1>Voter Registration</h1>

            <div className="camera-section">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', maxWidth: '640px' }}
                />

                {cameraError && <p className="error">{cameraError}</p>}

                <button onClick={startCamera}>
                    Start Camera
                </button>
            </div>
        </div>
    )
}
