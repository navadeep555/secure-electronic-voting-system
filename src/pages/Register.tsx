import { useRef, useState, useEffect } from 'react'
import { loadFaceApiModels, detectFaceLandmarks, analyzeHeadPose } from '../services/faceRecognition'
import { PageWrapper } from '../components/PageWrapper'
import { AnimatedContainer } from '../components/AnimatedContainer'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, RefreshCw, ArrowRight, ArrowLeft, ArrowUp, Camera } from 'lucide-react'

type PoseState = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP'
type Step = 1 | 2 | 3 | 4

export default function Register() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [currentStep, setCurrentStep] = useState<Step>(1)
    const [direction, setDirection] = useState<'left' | 'right'>('right')

    // Gamification states
    const [flashActive, setFlashActive] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    // Form Data Persistance
    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        aadhaar: '',
        state: '',
        district: ''
    })
    const [errors, setErrors] = useState<{ [key: string]: string }>({})

    // Validation Functions
    const validateAadhaar = (aadhaar: string) => {
        // Verhoeff algorithm implementation would go here
        // For now, checking 12 digits
        return /^\d{12}$/.test(aadhaar)
    }

    const validateAge = (dob: string) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age >= 18
    }

    const handleNext = () => {
        // Step 1 Validation
        if (currentStep === 1) {
            const newErrors: { [key: string]: string } = {}
            if (!formData.fullName) newErrors.fullName = 'Full Name is required'
            if (!formData.dob) newErrors.dob = 'Date of Birth is required'
            else if (!validateAge(formData.dob)) newErrors.dob = 'You must be at least 18 years old'

            if (!formData.aadhaar) newErrors.aadhaar = 'Aadhaar Number is required'
            else if (!validateAadhaar(formData.aadhaar)) newErrors.aadhaar = 'Invalid Aadhaar Number (must be 12 digits)'

            if (!formData.state) newErrors.state = 'State is required'
            if (!formData.district) newErrors.district = 'District is required'

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors)
                return
            }
            setErrors({})
        }

        setDirection('right')
        setCurrentStep(prev => Math.min(prev + 1, 4) as Step)
    }

    const handleBack = () => {
        setDirection('left')
        setCurrentStep(prev => Math.max(prev - 1, 1) as Step)
    }

    // Existing states...
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
            setCameraError('')
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            })
            if (videoRef.current) {
                videoRef.current.srcObject = stream
                setStream(stream)

                await loadFaceApiModels()
                startPoseDetection()
            }
        } catch (error: any) {
            console.error("Camera Error:", error)

            if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                setCameraError('Camera access was denied. Please enable camera permissions in your browser settings.')
            } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                setCameraError('No camera device found. Please connect a camera.')
            } else {
                setCameraError('Could not start camera. Please check your connection and try again.')
            }
            setDetectionMessage('Camera initialization failed')
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

            // Trigger flash effect
            setFlashActive(true)
            setTimeout(() => setFlashActive(false), 200)

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
            setShowSuccess(true)
            setDetectionMessage('All poses captured successfully!')
        }
    }

    const resetCapture = () => {
        setCapturedPoses({})
        setCurrentPose('CENTER')
        setShowSuccess(false)
        setDetectionMessage('Look straight at the camera')
        setIsDetecting(true)
        startPoseDetection()
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
        reader.readAsDataURL(file)
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <PageWrapper>
            <div className="register-container">
                <h1>Voter Registration - Step {currentStep} of 4</h1>

                {currentStep === 1 && (
                    <AnimatedContainer slideDirection={direction}>
                        <div className="form-group">
                            <input
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className={errors.fullName ? 'error-input' : ''}
                            />
                            {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}

                            <input
                                name="dob"
                                type="date"
                                placeholder="Date of Birth"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className={errors.dob ? 'error-input' : ''}
                            />
                            {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}

                            <input
                                name="aadhaar"
                                placeholder="Aadhaar Number"
                                value={formData.aadhaar}
                                onChange={handleInputChange}
                                maxLength={12}
                                className={errors.aadhaar ? 'error-input' : ''}
                            />
                            {errors.aadhaar && <p className="text-red-500 text-sm mt-1">{errors.aadhaar}</p>}

                            <input
                                name="state"
                                placeholder="State"
                                value={formData.state}
                                onChange={handleInputChange}
                                className={errors.state ? 'error-input' : ''}
                            />
                            {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}

                            <input
                                name="district"
                                placeholder="District"
                                value={formData.district}
                                onChange={handleInputChange}
                                className={errors.district ? 'error-input' : ''}
                            />
                            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                        </div>
                    </AnimatedContainer>
                )}

                {currentStep === 2 && (
                    <AnimatedContainer slideDirection={direction}>
                        <div className="document-section">
                            <h2>Upload Voter ID</h2>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleDocumentUpload}
                            />
                            {uploadError && <p className="error">{uploadError}</p>}
                            {documentPreview && (
                                <img src={documentPreview} alt="Preview" style={{ maxWidth: '300px' }} />
                            )}
                        </div>
                    </AnimatedContainer>
                )}

                {currentStep === 3 && (
                    <AnimatedContainer slideDirection={direction}>
                        <div className="camera-section relative">
                            <h2>Liveness Check</h2>

                            {/* Flash Effect */}
                            <AnimatePresence>
                                {flashActive && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.8 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-white z-50 pointer-events-none"
                                    />
                                )}
                            </AnimatePresence>

                            {/* Success Overlay */}
                            <AnimatePresence>
                                {showSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-40 flex flex-col items-center justify-center rounded-lg"
                                    >
                                        <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                                        <h3 className="text-2xl font-bold text-white mb-4">Verification Complete!</h3>
                                        <button
                                            onClick={resetCapture}
                                            className="flex items-center gap-2 px-6 py-2 bg-white text-green-600 rounded-full font-bold hover:bg-green-50 transition-colors"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Rescan
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="instructions flex flex-col items-center mb-4">
                                <motion.div
                                    key={currentPose}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="mb-2"
                                >
                                    {currentPose === 'CENTER' && <Camera className="w-12 h-12 text-blue-500" />}
                                    {currentPose === 'LEFT' && <ArrowLeft className="w-12 h-12 text-blue-500" />}
                                    {currentPose === 'RIGHT' && <ArrowRight className="w-12 h-12 text-blue-500" />}
                                    {currentPose === 'UP' && <ArrowUp className="w-12 h-12 text-blue-500" />}
                                </motion.div>
                                <p className="text-lg font-semibold text-gray-700">{detectionMessage}</p>
                            </div>

                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="rounded-lg shadow-lg"
                                style={{ width: '100%', maxWidth: '640px' }}
                            />

                            {/* Progress Indicators */}
                            <div className="flex gap-2 mt-4 justify-center">
                                {['CENTER', 'LEFT', 'RIGHT', 'UP'].map((pose) => (
                                    <div
                                        key={pose}
                                        className={`w-3 h-3 rounded-full ${capturedPoses[pose as PoseState] ? 'bg-green-500' :
                                            currentPose === pose ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>

                            {cameraError && (
                                <div className="error-container mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                                    <p className="text-red-600 mb-2 font-medium">{cameraError}</p>
                                    <a
                                        href="https://support.google.com/chrome/answer/2693767"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 underline text-sm hover:text-blue-800 flex items-center justify-center gap-1"
                                    >
                                        How to enable camera access
                                    </a>
                                </div>
                            )}

                            {!stream && (
                                <div className="button-group mt-4">
                                    <button onClick={startCamera}>Start Camera</button>
                                </div>
                            )}
                        </div>
                    </AnimatedContainer>
                )}

                {currentStep === 4 && (
                    <AnimatedContainer slideDirection={direction}>
                        <div className="review-section">
                            <h2>Review Details</h2>
                            <p><strong>Name:</strong> {formData.fullName}</p>
                            <p><strong>DOB:</strong> {formData.dob}</p>
                            <p><strong>Aadhaar:</strong> {formData.aadhaar.replace(/(\d{4})\d{4}(\d{4})/, '$1 XXXX $2')}</p>
                            <p><strong>Address:</strong> {formData.district}, {formData.state}</p>
                            <div className="review-images">
                                {documentPreview && <img src={documentPreview} alt="Doc" width="100" />}
                                {capturedPoses.CENTER && <img src={capturedPoses.CENTER} alt="Face" width="100" />}
                            </div>
                        </div>
                    </AnimatedContainer>
                )}

                <div className="navigation-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                    {currentStep > 1 && (
                        <button onClick={handleBack}>Back</button>
                    )}
                    {currentStep < 4 ? (
                        <button onClick={handleNext}>Next</button>
                    ) : (
                        <button onClick={() => alert('Registration Submitted!')}>Submit</button>
                    )}
                </div>
            </div>
        </PageWrapper>
    )
}
