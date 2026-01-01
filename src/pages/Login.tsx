import { useRef, useState } from 'react'

export default function Login() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState<string>('')
    const [capturedImage, setCapturedImage] = useState<string>('')

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

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const video = videoRef.current

            canvas.width = video.videoWidth
            canvas.height = video.videoHeight

            const ctx = canvas.getContext('2d')
            if (ctx) {
                ctx.drawImage(video, 0, 0)
                const imageData = canvas.toDataURL('image/jpeg')
                setCapturedImage(imageData)
            }
        }
    }

    return (
        <div className="login-container">
            <h1>Voter Login</h1>

            <div className="camera-section">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: '100%', maxWidth: '640px' }}
                />

                <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                />

                {cameraError && <p className="error">{cameraError}</p>}

                <div className="button-group">
                    <button onClick={startCamera}>
                        Start Camera
                    </button>

                    <button onClick={captureImage} disabled={!stream}>
                        Capture Face
                    </button>
                </div>

                {capturedImage && (
                    <div className="preview">
                        <h3>Captured Image:</h3>
                        <img
                            src={capturedImage}
                            alt="Captured face"
                            style={{ maxWidth: '400px', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
