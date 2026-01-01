import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState<string>('')
    const [capturedImage, setCapturedImage] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [loginMessage, setLoginMessage] = useState<string>('')
    const [loginError, setLoginError] = useState<string>('')

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

    const handleLogin = async () => {
        if (!capturedImage) {
            setLoginError('Please capture your face first')
            return
        }

        setIsLoading(true)
        setLoginError('')
        setLoginMessage('')

        try {
            const response = await fetch('http://localhost:5001/api/recognize_face', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    faceImage: capturedImage,
                    tolerance: 0.6
                })
            })

            const data = await response.json()

            if (data.success && data.matched_user) {
                setLoginMessage(`Welcome back, ${data.matched_user}!`)

                // Store user info in localStorage
                localStorage.setItem('userId', data.matched_user)
                localStorage.setItem('isAuthenticated', 'true')

                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    navigate('/dashboard')
                }, 1000)
            } else {
                setLoginError(data.message || 'Face not recognized. Please try again.')
            }
        } catch (error) {
            console.error('Login error:', error)
            setLoginError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
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
                {loginError && <p className="error">{loginError}</p>}
                {loginMessage && <p className="success">{loginMessage}</p>}

                <div className="button-group">
                    <button onClick={startCamera} disabled={isLoading}>
                        Start Camera
                    </button>

                    <button onClick={captureImage} disabled={!stream || isLoading}>
                        Capture Face
                    </button>

                    <button onClick={handleLogin} disabled={!capturedImage || isLoading}>
                        {isLoading ? 'Verifying...' : 'Login'}
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
