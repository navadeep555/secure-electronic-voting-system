import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageWrapper } from '../components/PageWrapper'
import { staggerContainer, staggerItem } from '../lib/animations'

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
        <PageWrapper>
            <motion.div
                className="login-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    Voter Login
                </motion.h1>

                <motion.div
                    className="camera-section"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                >
                    <motion.video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        style={{ width: '100%', maxWidth: '640px' }}
                        variants={staggerItem}
                    />

                    <canvas
                        ref={canvasRef}
                        style={{ display: 'none' }}
                    />

                    {cameraError && (
                        <motion.p
                            className="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {cameraError}
                        </motion.p>
                    )}
                    {loginError && (
                        <motion.p
                            className="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {loginError}
                        </motion.p>
                    )}
                    {loginMessage && (
                        <motion.p
                            className="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            {loginMessage}
                        </motion.p>
                    )}

                    <motion.div
                        className="button-group"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.button
                            onClick={startCamera}
                            disabled={isLoading}
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Start Camera
                        </motion.button>

                        <motion.button
                            onClick={captureImage}
                            disabled={!stream || isLoading}
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Capture Face
                        </motion.button>

                        <motion.button
                            onClick={handleLogin}
                            disabled={!capturedImage || isLoading}
                            variants={staggerItem}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isLoading ? 'Verifying...' : 'Login'}
                        </motion.button>
                    </motion.div>

                    {capturedImage && (
                        <motion.div
                            className="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h3>Captured Image:</h3>
                            <img
                                src={capturedImage}
                                alt="Captured face"
                                style={{ maxWidth: '400px', marginTop: '10px' }}
                            />
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </PageWrapper>
    )
}
