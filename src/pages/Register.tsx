import { useRef, useState, useEffect } from 'react'
import { loadFaceApiModels, detectFaceLandmarks, analyzeHeadPose } from '../services/faceRecognition'

type PoseState = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP'

export default function Register() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState<string>('')
    const [documentImage, setDocumentImage] = useState<string>('')
    const [documentPreview, setDocumentPreview] = useState<string>('')
    const [uploadError, setUploadError] = useState<string>('')

    // Liveness detection state machine
    const [currentPose, setCurrentPose] = useState<PoseState>('CENTER')
    const [capturedPoses, setCapturedPoses] = useState<{
        CENTER?: string
        LEFT?: string
        RIGHT?: string
        UP?: string
    }>({})
    const [detectionMessage, setDetectionMessage] = useState('Look straight at the camera')
    const [isDetecting, setIsDetecting] = useState(false)
    const detectionIntervalRef = useRef<number | null>(null)

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

            // Load face-api.js models
            await loadFaceApiModels()

            // Start pose detection
            startPoseDetection()
        } catch (error) {
            console.error('Camera access error:', error)
            setCameraError('Unable to access camera. Please grant permission.')
        }
    }

    const startPoseDetection = () => {
        setIsDetecting(true)
        setCurrentPose('CENTER')
        setDetectionMessage('Look straight at the camera')

        // Pose detection loop
        const detectPose = async () => {
            if (!videoRef.current || !isDetecting) return

            const detection = await detectFaceLandmarks(videoRef.current)

            if (detection) {
                const pose = analyzeHeadPose(detection.landmarks)

                // Check if current pose matches required pose
                if (pose.direction === currentPose && pose.confidence > 0.7) {
                    // Auto-capture after stable detection
                    await captureCurrentPose()
                } else {
                    // Update instruction message
                    updatePoseInstruction(currentPose)
                }
            } else {
                setDetectionMessage('No face detected. Please position your face in the frame.')
            }
        }

        // Run detection every 500ms
        detectionIntervalRef.current = window.setInterval(detectPose, 500)
    }

    const updatePoseInstruction = (pose: PoseState) => {
        const instructions = {
            CENTER: 'Look straight at the camera',
            LEFT: 'Turn your head to the LEFT',
            RIGHT: 'Turn your head to the RIGHT',
            UP: 'Tilt your head UP'
        }
        setDetectionMessage(instructions[pose])
    }

    const captureCurrentPose = async () => {
        if (!videoRef.current || capturedPoses[currentPose]) return

        // Create canvas and capture frame
        const canvas = document.createElement('canvas')
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0)
            const imageData = canvas.toDataURL('image/jpeg')

            // Save captured pose
            setCapturedPoses(prev => ({
                ...prev,
                [currentPose]: imageData
            }))

            setDetectionMessage(`${currentPose} pose captured!`)

            // Move to next pose
            setTimeout(() => {
                moveToNextPose()
            }, 1000)
        }
    }

    const moveToNextPose = () => {
        const poseSequence: PoseState[] = ['CENTER', 'LEFT', 'RIGHT', 'UP']
        const currentIndex = poseSequence.indexOf(currentPose)

        if (currentIndex < poseSequence.length - 1) {
            const nextPose = poseSequence[currentIndex + 1]
            setCurrentPose(nextPose)
            updatePoseInstruction(nextPose)
        } else {
            // All poses captured
            stopPoseDetection()
            setDetectionMessage('All poses captured successfully!')
        }
    }

    const stopPoseDetection = () => {
        setIsDetecting(false)
        if (detectionIntervalRef.current) {
            clearInterval(detectionIntervalRef.current)
            detectionIntervalRef.current = null
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPoseDetection()
        }
    }, [])

    const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if (!file) return

        // Basic file validation
        const maxSize = 5 * 1024 * 1024 // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']

        if (!allowedTypes.includes(file.type)) {
            setUploadError('Please upload a valid image file (JPEG, PNG)')
            return
        }

        if (file.size > maxSize) {
            setUploadError('File size must be less than 5MB')
            return
        }

        // Read file and create preview
        const reader = new FileReader()
        reader.onload = (event) => {
            const base64 = event.target?.result as string
            setDocumentImage(base64)
            setDocumentPreview(base64)
            setUploadError('')
        }
        reader.readAsDataURL(file)
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

            <div className="document-section">
                <h2>Upload Voter ID</h2>

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleDocumentUpload}
                />

                {uploadError && <p className="error">{uploadError}</p>}

                {documentPreview && (
                    <div className="preview">
                        <img
                            src={documentPreview}
                            alt="Document preview"
                            style={{ maxWidth: '400px', marginTop: '10px' }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
