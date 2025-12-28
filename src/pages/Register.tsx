import { useRef, useState } from 'react'

export default function Register() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [stream, setStream] = useState<MediaStream | null>(null)
    const [cameraError, setCameraError] = useState<string>('')
    const [documentImage, setDocumentImage] = useState<string>('')
    const [documentPreview, setDocumentPreview] = useState<string>('')
    const [uploadError, setUploadError] = useState<string>('')

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
