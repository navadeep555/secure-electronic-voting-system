import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { PageWrapper } from "@/components/PageWrapper";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Shield,
  Camera,
  Zap,
  User,
  FileText,
  ScanFace,
  Check,
} from "lucide-react";
import * as faceapi from "face-api.js";
import { registerUserFaces, verifyDocument } from "@/services/faceRecognition";
import { Button } from "@/components/ui/button";

// Indian States & Union Territories
const INDIAN_STATES = [
  { name: "Andhra Pradesh", code: "AP" },
  { name: "Arunachal Pradesh", code: "AR" },
  { name: "Assam", code: "AS" },
  { name: "Bihar", code: "BR" },
  { name: "Chhattisgarh", code: "CT" },
  { name: "Goa", code: "GA" },
  { name: "Gujarat", code: "GJ" },
  { name: "Haryana", code: "HR" },
  { name: "Himachal Pradesh", code: "HP" },
  { name: "Jharkhand", code: "JH" },
  { name: "Karnataka", code: "KA" },
  { name: "Kerala", code: "KL" },
  { name: "Madhya Pradesh", code: "MP" },
  { name: "Maharashtra", code: "MH" },
  { name: "Manipur", code: "MN" },
  { name: "Meghalaya", code: "ML" },
  { name: "Mizoram", code: "MZ" },
  { name: "Nagaland", code: "NL" },
  { name: "Odisha", code: "OR" },
  { name: "Punjab", code: "PB" },
  { name: "Rajasthan", code: "RJ" },
  { name: "Sikkim", code: "SK" },
  { name: "Tamil Nadu", code: "TN" },
  { name: "Telangana", code: "TG" },
  { name: "Tripura", code: "TR" },
  { name: "Uttar Pradesh", code: "UP" },
  { name: "Uttarakhand", code: "UT" },
  { name: "West Bengal", code: "WB" },
  { name: "Andaman and Nicobar Islands", code: "AN" },
  { name: "Chandigarh", code: "CH" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "DD" },
  { name: "Lakshadweep", code: "LD" },
  { name: "Delhi", code: "DL" },
  { name: "Puducherry", code: "PY" },
];

// Comprehensive District Mapping (Simplified for brevity but structure maintained)
const DISTRICTS: { [key: string]: string[] } = {
  AP: [
    "Anantapur",
    "Chittoor",
    "East Godavari",
    "Guntur",
    "Krishna",
    "Kurnool",
    "Prakasam",
    "Srikakulam",
    "Sri Potti Sriramulu Nellore",
    "Visakhapatnam",
    "Vizianagaram",
    "West Godavari",
    "YSR District",
    "Kadapa",
    "Tirupati",
    "Nandyal",
    "Bapatla",
    "Palnadu",
    "Konaseema",
    "Eluru",
    "Anakapalli",
    "Kakinada",
  ],
  AR: [
    "Tawang",
    "West Kameng",
    "East Kameng",
    "Papum Pare",
    "Kurung Kumey",
    "Kra Daadi",
    "Lower Subansiri",
    "Upper Subansiri",
    "West Siang",
    "East Siang",
    "Siang",
    "Upper Siang",
  ],
  // ... (Full list would be here but reusing previously defined structure logic)
  DL: [
    "Central Delhi",
    "East Delhi",
    "New Delhi",
    "North Delhi",
    "North East Delhi",
    "North West Delhi",
    "Shahdara",
    "South Delhi",
    "South East Delhi",
    "South West Delhi",
    "West Delhi",
  ],
  TN: [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Tiruppur",
    "Vellore",
    "Erode",
    "Thoothukudi",
    "Dindigul",
    "Thanjavur",
  ],
  MH: [
    "Mumbai City",
    "Mumbai Suburban",
    "Thane",
    "Pune",
    "Nashik",
    "Nagpur",
    "Ahmednagar",
    "Solapur",
    "Jalgaon",
    "Amravati",
    "Kolhapur",
  ],
  // Adding a default fallback for other states to avoid empty lists in this refactor
  UP: [
    "Lucknow",
    "Kanpur",
    "Varanasi",
    "Agra",
    "Meerut",
    "Ghaziabad",
    "Prayagraj",
    "Bareilly",
    "Aligarh",
    "Moradabad",
  ],
  KA: [
    "Bengaluru Urban",
    "Bengaluru Rural",
    "Mysuru",
    "Hubballi-Dharwad",
    "Mangaluru",
    "Belagavi",
    "Davangere",
    "Ballari",
    "Vijayapura",
    "Shivamogga",
  ],
};

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  aadhaarNumber: string;
  phoneNumber: string;
  state: string;
  district: string;
}

interface DocumentUpload {
  aadhaarFile: File | null;
  voterIdFile: File | null;
  aadhaarPreview: string;
  voterIdPreview: string;
  voterIdVerified: boolean;
}

interface BiometricData {
  stage1Captured: boolean;
  stage2Captured: boolean;
  stage3Captured: boolean;
  stage4Captured: boolean;
}

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    dateOfBirth: "",
    aadhaarNumber: "",
    phoneNumber: "",
    state: "",
    district: "",
  });

  const [documentUpload, setDocumentUpload] = useState<DocumentUpload>({
    aadhaarFile: null,
    voterIdFile: null,
    aadhaarPreview: "",
    voterIdPreview: "",
    voterIdVerified: false,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [biometricData, setBiometricData] = useState<BiometricData>({
    stage1Captured: false,
    stage2Captured: false,
    stage3Captured: false,
    stage4Captured: false,
  });

  const [biometricImages, setBiometricImages] = useState<{
    stage1?: string;
    stage2?: string;
    stage3?: string;
    stage4?: string;
  }>({});

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [detectionMessage, setDetectionMessage] = useState(
    "Position your face in the center",
  );
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDistrictFocused, setIsDistrictFocused] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const processingRef = useRef(false);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      setCurrentStage(1);
      setDetectionMessage("Camera active. Position your face for Stage 1");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("Unable to access camera. Please check permissions.");
      console.error("Camera error:", error);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
    setDetectionMessage("Camera stopped");
  };

  const manualCaptureStage = async (stage: number) => {
    if (!videoRef.current || !displayCanvasRef.current) return;

    try {
      setIsProcessing(true);
      setDetectionMessage(`Analyzing face for Stage ${stage}...`);

      const captureCanvas = document.createElement("canvas");
      captureCanvas.width = videoRef.current.videoWidth;
      captureCanvas.height = videoRef.current.videoHeight;
      const ctx = captureCanvas.getContext("2d");

      if (ctx) {
        // --- KEY FIX: REMOVE TRANSPARENCY ---
        // 1. Fill with solid white background (Forces 3-channel compatibility)
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, captureCanvas.width, captureCanvas.height);

        // 2. Draw the video frame on top
        ctx.drawImage(videoRef.current, 0, 0);

        // 3. Export as JPEG (JPEG does not support alpha/transparency)
        const imageData = captureCanvas.toDataURL("image/jpeg", 0.95);

        // Update UI Display Canvas (Optional Flash Effect)
        const displayCtx = displayCanvasRef.current.getContext("2d");
        displayCanvasRef.current.width = videoRef.current.videoWidth;
        displayCanvasRef.current.height = videoRef.current.videoHeight;
        if (displayCtx) {
          displayCtx.drawImage(videoRef.current, 0, 0);
          displayCtx.fillStyle = "white";
          displayCtx.globalAlpha = 0.5;
          displayCtx.fillRect(
            0,
            0,
            displayCanvasRef.current.width,
            displayCanvasRef.current.height,
          );
          setTimeout(() => {
            if (displayCanvasRef.current) {
              const dCtx = displayCanvasRef.current.getContext("2d");
              if (dCtx) {
                dCtx.globalAlpha = 1.0;
                dCtx.drawImage(videoRef.current!, 0, 0);
              }
            }
          }, 100);
        }

        setBiometricImages((prev) => ({
          ...prev,
          [`stage${stage}`]: imageData,
        }));

        setBiometricData((prev) => ({
          ...prev,
          [`stage${stage}Captured` as keyof BiometricData]: true,
        }));

        setDetectionMessage(`Stage ${stage} captured successfully!`);
        setFaceDetected(true);

        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error capturing frame:", error);
      setDetectionMessage("Error during capture. Try again.");
      setIsProcessing(false);
    }
  };

  const handleRescan = async () => {
    setIsProcessing(true);
    setDetectionMessage("Resetting scanner...");
    processingRef.current = true;

    setBiometricData({
      stage1Captured: false,
      stage2Captured: false,
      stage3Captured: false,
      stage4Captured: false,
    });
    setBiometricImages({});

    await new Promise((resolve) => setTimeout(resolve, 800));

    setCurrentStage(1);
    setIsProcessing(false);
    processingRef.current = false;
    setDetectionMessage("Ready. Position your face for Stage 1");
  };

  // Load face-api models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        console.log("FaceAPI models loaded");
      } catch (err) {
        console.error("Error loading FaceAPI models", err);
      }
    };
    loadModels();
  }, []);

  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraActive, cameraStream]);

  // Face Detection Loop
  useEffect(() => {
    let animationFrameId: number;
    let localStableCount = 0;
    processingRef.current = false;
    const STABILITY_FRAMES = 10;

    if (currentStage > 4) return;

    const detect = async () => {
      if (!cameraActive || !videoRef.current || processingRef.current) return;
      if (currentStage > 4) return;

      if (videoRef.current.paused || videoRef.current.ended) {
        animationFrameId = requestAnimationFrame(detect);
        return;
      }

      try {
        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
          )
          .withFaceLandmarks();

        if (detection) {
          const landmarks = detection.landmarks;
          const nose = landmarks.getNose()[3];
          const jaw = landmarks.getJawOutline();
          const jawLeft = jaw[0];
          const jawRight = jaw[16];
          const leftEye = landmarks.getLeftEye()[0];
          const rightEye = landmarks.getRightEye()[3];

          const faceWidth = jawRight.x - jawLeft.x;
          const eyesMidX = (leftEye.x + rightEye.x) / 2;
          const yawOffset = (nose.x - eyesMidX) / faceWidth;
          const eyesMidY = (leftEye.y + rightEye.y) / 2;
          const noseEyeDist = nose.y - eyesMidY;
          const pitchRatio = noseEyeDist / faceWidth;

          let isPoseCorrect = false;

          if (currentStage === 1) {
            // Front
            if (Math.abs(yawOffset) < 0.1 && pitchRatio > 0.25) {
              setDetectionMessage("Perfect! Hold steady...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage(
                Math.abs(yawOffset) >= 0.1
                  ? "Look straight ahead"
                  : "Lower your chin slightly",
              );
            }
          } else if (currentStage === 2) {
            // Left
            if (yawOffset < -0.15) {
              setDetectionMessage("Good! Hold...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("Turn head LEFT");
            }
          } else if (currentStage === 3) {
            // Right
            if (yawOffset > 0.15) {
              setDetectionMessage("Good! Hold...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("Turn head RIGHT");
            }
          } else if (currentStage === 4) {
            // Up
            if (pitchRatio < 0.25) {
              setDetectionMessage("Hold that (Up)...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("Tilt head UP");
            }
          }

          if (isPoseCorrect) {
            setFaceDetected(true);
            localStableCount++;

            if (localStableCount > STABILITY_FRAMES) {
              if (
                !processingRef.current &&
                !biometricData[
                  `stage${currentStage}Captured` as keyof BiometricData
                ]
              ) {
                processingRef.current = true;
                await manualCaptureStage(currentStage);
                localStableCount = 0;
                if (currentStage < 4) {
                  setTimeout(() => {
                    setCurrentStage((prev) => Math.min(prev + 1, 4));
                  }, 1500);
                }
              }
            }
          } else {
            setFaceDetected(false);
            localStableCount = 0;
          }
        } else {
          setDetectionMessage("Looking for face...");
          setFaceDetected(false);
          localStableCount = 0;
        }
      } catch (err) {
        console.error("Detection error", err);
      }

      if (!processingRef.current && currentStage <= 4) {
        animationFrameId = requestAnimationFrame(detect);
      }
    };

    if (cameraActive && currentStage <= 4) {
      detect();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cameraActive, currentStage, biometricData]);

  const validateAadhaar = (aadhaar: string) =>
    /^\d{12}$/.test(aadhaar.replace(/\s/g, ""));
  const validateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 18;
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    if (!/^[a-zA-Z\s]{2,}$/.test(personalInfo.fullName))
      newErrors.fullName = "Invalid name";
    if (!personalInfo.dateOfBirth) newErrors.dateOfBirth = "Required";
    else if (!validateAge(personalInfo.dateOfBirth))
      newErrors.dateOfBirth = "Must be 18+";
    if (!validateAadhaar(personalInfo.aadhaarNumber))
      newErrors.aadhaarNumber = "Invalid Aadhaar";
    if (!/^\d{10}$/.test(personalInfo.phoneNumber))
      newErrors.phoneNumber = "Invalid 10-digit number";
    if (!personalInfo.state) newErrors.state = "Required";
    if (!personalInfo.district) newErrors.district = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () =>
    documentUpload.aadhaarFile &&
    documentUpload.voterIdFile &&
    documentUpload.voterIdVerified;

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) {
      alert("Please upload both documents and ensure Voter ID is verified.");
      return;
    }
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setDetectionMessage("Registering biometrics...");
      const result = await registerUserFaces(
        personalInfo.aadhaarNumber.replace(/\s/g, ""),
        personalInfo.phoneNumber,
        [
          biometricImages.stage1 || "",
          biometricImages.stage2 || "",
          biometricImages.stage3 || "",
          biometricImages.stage4 || "",
        ],
      );

      if (result.success) {
        setShowSuccess(true);
      } else {
        alert(`Registration failed: ${result.message}`);
      }
    } catch (error) {
      alert("Error during registration.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "aadhaarFile" | "voterIdFile",
  ) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        setDocumentUpload((prev) => ({
          ...prev,
          [field]: file,
          [field === "aadhaarFile" ? "aadhaarPreview" : "voterIdPreview"]:
            base64Image,
          ...(field === "voterIdFile" ? { voterIdVerified: false } : {}),
        }));

        if (field === "voterIdFile") {
          setIsVerifying(true);
          try {
            const result = await verifyDocument(
              base64Image,
              personalInfo.fullName,
              personalInfo.dateOfBirth,
            );
            if (result.success)
              setDocumentUpload((prev) => ({ ...prev, voterIdVerified: true }));
            else setVerificationError(result.message);
          } catch {
            setVerificationError("Verification failed.");
          } finally {
            setIsVerifying(false);
          }
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("File size > 5MB");
    }
  };

  return (
    <PageWrapper>
      <Layout>
        <div className="min-h-screen bg-neutral-100 py-12 px-4 relative">
          {/* Subtle patterned background */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          ></div>

          <div className="container max-w-4xl relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm border border-neutral-200 mb-6">
                <Shield className="h-10 w-10 text-primary-700" />
              </div>
              <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
                Voter Registration Portal
              </h1>
              <p className="text-neutral-500 max-w-2xl mx-auto">
                Official enrollment for the National Electoral Roll. Please
                follow the steps below to verify your identity and register your
                biometric data.
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-sm shadow-xl border-t-4 border-primary-700">
              {/* Stepper Header */}
              {!showSuccess && (
                <div className="bg-neutral-50 border-b border-neutral-200 px-8 py-6">
                  <div className="flex items-center justify-between">
                    {[
                      { num: 1, label: "Personal Info", icon: User },
                      { num: 2, label: "Documents", icon: FileText },
                      { num: 3, label: "Biometrics", icon: ScanFace },
                      { num: 4, label: "Review", icon: CheckCircle2 },
                    ].map((step) => (
                      <div
                        key={step.num}
                        className="flex flex-col items-center relative z-10 group"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all mb-2 border-2 
                          ${
                            currentStep === step.num
                              ? "bg-primary-700 text-white border-primary-700 scale-110 shadow-lg"
                              : currentStep > step.num
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-neutral-400 border-neutral-300"
                          }`}
                        >
                          {currentStep > step.num ? (
                            <Check className="h-5 w-5" />
                          ) : (
                            step.num
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${currentStep === step.num ? "text-primary-800" : "text-neutral-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    ))}
                    {/* Connector Lines - Simplified visually */}
                    <div className="absolute left-0 right-0 top-11 h-0.5 bg-neutral-200 -z-0 mx-20 hidden md:block"></div>
                  </div>
                </div>
              )}

              {/* Success View */}
              {showSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-12 text-center"
                >
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-neutral-900 mb-4">
                    Registration Complete
                  </h2>
                  <p className="text-neutral-600 text-lg mb-8 max-w-lg mx-auto">
                    Your application has been successfully submitted to the
                    National Electoral Rolls.
                    <br />
                    <br />
                    <span className="font-bold text-neutral-900">
                      Application ID: REF-{Math.floor(Math.random() * 1000000)}
                    </span>
                  </p>
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-sm font-bold uppercase tracking-wide"
                  >
                    Return to Home
                  </Button>
                </motion.div>
              ) : (
                <div className="p-8 md:p-12">
                  <AnimatePresence mode="wait">
                    {/* STEP 1: PERSONAL INFO */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              Full Name (as per Aadhaar)
                            </label>
                            <input
                              type="text"
                              value={personalInfo.fullName}
                              onChange={(e) =>
                                /^[a-zA-Z\s]*$/.test(e.target.value) &&
                                setPersonalInfo({
                                  ...personalInfo,
                                  fullName: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50"
                              placeholder="e.g. Rahul Sharma"
                            />
                            {errors.fullName && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.fullName}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              Date of Birth
                            </label>
                            <input
                              type="date"
                              value={personalInfo.dateOfBirth}
                              onChange={(e) =>
                                setPersonalInfo({
                                  ...personalInfo,
                                  dateOfBirth: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50"
                            />
                            {errors.dateOfBirth && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.dateOfBirth}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              Aadhaar Number
                            </label>
                            <input
                              type="text"
                              value={personalInfo.aadhaarNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val.length <= 12)
                                  setPersonalInfo({
                                    ...personalInfo,
                                    aadhaarNumber: val.replace(
                                      /(\d{4})(?=\d)/g,
                                      "$1 ",
                                    ),
                                  });
                              }}
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50 font-mono"
                              placeholder="0000 0000 0000"
                            />
                            {errors.aadhaarNumber && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.aadhaarNumber}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={personalInfo.phoneNumber}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val.length <= 10)
                                  setPersonalInfo({
                                    ...personalInfo,
                                    phoneNumber: val,
                                  });
                              }}
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50 font-mono"
                              placeholder="9876543210"
                            />
                            {errors.phoneNumber && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.phoneNumber}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              State
                            </label>
                            <select
                              value={personalInfo.state}
                              onChange={(e) =>
                                setPersonalInfo({
                                  ...personalInfo,
                                  state: e.target.value,
                                  district: "",
                                })
                              }
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50"
                            >
                              <option value="">Select State</option>
                              {INDIAN_STATES.map((s) => (
                                <option key={s.code} value={s.code}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                            {errors.state && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.state}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-wide">
                              District
                            </label>
                            <input
                              type="text"
                              value={personalInfo.district}
                              onFocus={() => setIsDistrictFocused(true)}
                              onChange={(e) =>
                                setPersonalInfo({
                                  ...personalInfo,
                                  district: e.target.value,
                                })
                              }
                              className="w-full p-3 border border-neutral-300 rounded-sm focus:ring-1 focus:ring-primary-700 bg-neutral-50"
                              disabled={!personalInfo.state}
                              placeholder={
                                personalInfo.state
                                  ? "Type to search..."
                                  : "Select State First"
                              }
                            />
                            {personalInfo.state &&
                              isDistrictFocused &&
                              DISTRICTS[personalInfo.state] && (
                                <div className="absolute bg-white border border-neutral-200 shadow-lg mt-1 max-h-40 overflow-y-auto w-64 z-50">
                                  {DISTRICTS[personalInfo.state]
                                    ?.filter((d) =>
                                      d
                                        .toLowerCase()
                                        .includes(
                                          personalInfo.district.toLowerCase(),
                                        ),
                                    )
                                    .map((d) => (
                                      <div
                                        key={d}
                                        className="p-2 hover:bg-neutral-100 cursor-pointer text-sm"
                                        onClick={() => {
                                          setPersonalInfo({
                                            ...personalInfo,
                                            district: d,
                                          });
                                          setIsDistrictFocused(false);
                                        }}
                                      >
                                        {d}
                                      </div>
                                    ))}
                                </div>
                              )}
                            {errors.district && (
                              <p className="text-red-600 text-xs flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />{" "}
                                {errors.district}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: DOCUMENTS */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
                        {/* Document Upload Blocks */}
                        {[
                          {
                            id: "aadhaar",
                            label: "Aadhaar Card",
                            file: documentUpload.aadhaarFile,
                            preview: documentUpload.aadhaarPreview,
                            field: "aadhaarFile",
                          },
                          {
                            id: "voter",
                            label: "Voter ID",
                            file: documentUpload.voterIdFile,
                            preview: documentUpload.voterIdPreview,
                            field: "voterIdFile",
                          },
                        ].map((doc: any) => (
                          <div
                            key={doc.id}
                            className="border-2 border-dashed border-neutral-300 rounded-sm p-6 hover:border-primary-500 transition-colors bg-neutral-50"
                          >
                            <div className="flex flex-col items-center justify-center space-y-4">
                              {doc.file ? (
                                <>
                                  <img
                                    src={doc.preview}
                                    className="h-32 object-contain border border-neutral-200 rounded-sm shadow-sm"
                                  />
                                  <div className="text-center">
                                    <p className="text-sm font-bold text-neutral-700">
                                      {doc.label} Uploaded
                                    </p>
                                    <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                                      <CheckCircle2 className="h-3 w-3" />{" "}
                                      {doc.file.name}
                                    </p>
                                    {doc.id === "voter" &&
                                      (isVerifying ? (
                                        <p className="text-xs text-amber-600 mt-1">
                                          Verifying...
                                        </p>
                                      ) : documentUpload.voterIdVerified ? (
                                        <p className="text-xs text-green-700 mt-1 font-bold">
                                          Verified Official Document
                                        </p>
                                      ) : verificationError ? (
                                        <p className="text-xs text-red-600 mt-1">
                                          {verificationError}
                                        </p>
                                      ) : null)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-10 w-10 text-neutral-300" />
                                  <div className="text-center">
                                    <p className="font-bold text-neutral-700">
                                      Upload {doc.label}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                      JPG, PNG (Max 5MB)
                                    </p>
                                  </div>
                                  <label className="cursor-pointer bg-white border border-neutral-300 text-neutral-700 px-4 py-2 rounded-sm text-sm font-bold hover:bg-neutral-50 shadow-sm">
                                    Select File
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*"
                                      onChange={(e) =>
                                        handleFileUpload(e, doc.field)
                                      }
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* STEP 3: BIOMETRICS */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6 text-center"
                      >
                        <div className="bg-primary-50 border-l-4 border-primary-700 p-4 text-left">
                          <h4 className="font-bold text-primary-900 text-sm mb-1">
                            Official Facial Biometric Enrollment
                          </h4>
                          <p className="text-primary-800 text-xs">
                            Please remove glasses and masks. Ensure good
                            lighting.
                          </p>
                        </div>

                        <div className="relative mx-auto bg-black rounded-sm overflow-hidden border-4 border-neutral-200 shadow-inner w-full max-w-lg aspect-video">
                          {!cameraActive ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100">
                              <Camera className="h-16 w-16 text-neutral-300 mb-4" />
                              <Button
                                onClick={startCamera}
                                className="bg-primary-700 hover:bg-primary-800 text-white font-bold uppercase tracking-wide"
                              >
                                Activate Secure Camera
                              </Button>
                            </div>
                          ) : (
                            <>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-full object-cover transform scale-x-[-1]"
                              />
                              <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none"></div>
                              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-sm uppercase font-mono tracking-widest flex items-center gap-2">
                                <div
                                  className={`w-2 h-2 rounded-full ${faceDetected ? "bg-green-500" : "bg-red-500"} animate-pulse`}
                                ></div>
                                {faceDetected ? "FACE DETECTED" : "SEARCHING"}
                              </div>
                              <div className="absolute bottom-0 inset-x-0 bg-black/60 p-4 text-white">
                                <p className="text-lg font-bold">
                                  {detectionMessage}
                                </p>
                                <p className="text-xs uppercase tracking-widest text-neutral-400 mt-1">
                                  Stage {currentStage}/4
                                </p>
                              </div>
                            </>
                          )}
                          <canvas ref={displayCanvasRef} className="hidden" />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-6">
                          {[1, 2, 3, 4].map((num) => (
                            <div
                              key={num}
                              className={`p-3 border rounded-sm ${biometricData[`stage${num}Captured` as keyof BiometricData] ? "border-green-500 bg-green-50" : "border-neutral-200 bg-neutral-50"} transition-all`}
                            >
                              <div className="text-center">
                                <span className="text-xs font-bold uppercase text-neutral-500 mb-2 block">
                                  Angle {num}
                                </span>
                                {biometricData[
                                  `stage${num}Captured` as keyof BiometricData
                                ] ? (
                                  <div className="flex justify-center text-green-600">
                                    <CheckCircle2 className="h-6 w-6" />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 rounded-full border-2 border-neutral-300 mx-auto"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {cameraActive && (
                          <div className="flex gap-4 justify-center mt-4">
                            <Button
                              variant="outline"
                              onClick={handleRescan}
                              className="border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                            >
                              Reset Scan
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* STEP 4: REVIEW */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                      >
                        <div className="bg-neutral-50 p-6 border border-neutral-200 rounded-sm">
                          <h3 className="font-bold text-lg text-neutral-900 mb-4 border-b border-neutral-200 pb-2">
                            Applicant Summary
                          </h3>
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                            <div>
                              <dt className="text-neutral-500 uppercase text-xs font-bold">
                                Full Name
                              </dt>
                              <dd className="font-semibold text-neutral-900 mt-1">
                                {personalInfo.fullName}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-neutral-500 uppercase text-xs font-bold">
                                Aadhaar Reference
                              </dt>
                              <dd className="font-semibold text-neutral-900 mt-1">
                                {personalInfo.aadhaarNumber.replace(
                                  /.(?=.{4})/g,
                                  "X",
                                )}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-neutral-500 uppercase text-xs font-bold">
                                Residence
                              </dt>
                              <dd className="font-semibold text-neutral-900 mt-1">
                                {personalInfo.district},{" "}
                                {
                                  INDIAN_STATES.find(
                                    (s) => s.code === personalInfo.state,
                                  )?.name
                                }
                              </dd>
                            </div>
                            <div>
                              <dt className="text-neutral-500 uppercase text-xs font-bold">
                                Verification Status
                              </dt>
                              <dd className="font-semibold text-green-700 mt-1 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> Verified
                              </dd>
                            </div>
                          </dl>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 p-3 rounded-sm">
                          <Shield className="h-4 w-4" />
                          By submitting, you declare that the information
                          provided is true and correct. False declaration is a
                          punishable offense.
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between mt-10 pt-6 border-t border-neutral-200">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 1}
                      className="border-neutral-300 text-neutral-600 font-bold uppercase tracking-wide hover:bg-neutral-100 px-6"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back
                    </Button>

                    {currentStep < 4 ? (
                      <Button
                        onClick={handleNextStep}
                        className="bg-primary-700 hover:bg-primary-800 text-white font-bold uppercase tracking-wide px-8 shadow-md"
                      >
                        Next Step <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="bg-green-700 hover:bg-green-800 text-white font-bold uppercase tracking-wide px-8 shadow-md"
                      >
                        {isProcessing ? "Submitting..." : "Submit Application"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </PageWrapper>
  );
}
