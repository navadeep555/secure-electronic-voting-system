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
} from "lucide-react";
import * as faceapi from "face-api.js";
import { registerUserFaces } from "@/services/faceRecognition";

// Indian States & Union Territories (same as before)
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

// Comprehensive District Mapping
const DISTRICTS: { [key: string]: string[] } = {
  AP: ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR District", "Kadapa", "Tirupati", "Nandyal", "Bapatla", "Palnadu", "Konaseema", "Eluru", "Anakapalli", "Kakinada", "Dr. B.R. Ambedkar Konaseema"],
  AR: ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Kra Daadi", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  AS: ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup Metropolitan", "Kamrup", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  BR: ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  CT: ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Gaurela Pendra Marwahi", "Janjgir Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  GA: ["North Goa", "South Goa"],
  GJ: ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  HR: ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  HP: ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  JH: ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  KA: ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayapura", "Yadgir"],
  KL: ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  MP: ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  MH: ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  MN: ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  ML: ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  MZ: ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  NL: ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
  OR: ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  PB: ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar", "Sangrur", "Shahid Bhagat Singh Nagar", "Sri Muktsar Sahib", "Tarn Taran"],
  RJ: ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  SK: ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  TN: ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  TG: ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
  TR: ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  UP: ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  UT: ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  WB: ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"],
  DL: ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  CH: ["Chandigarh"],
  PY: ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  AN: ["Nicobar", "North and Middle Andaman", "South Andaman"],
  LD: ["Lakshadweep"],
  DD: ["Daman", "Diu", "Dadra and Nagar Haveli"],
};

interface PersonalInfo {
  fullName: string;
  dateOfBirth: string;
  mobileNumber: string;
  aadhaarNumber: string;
  state: string;
  district: string;
}

interface DocumentUpload {
  aadhaarFile: File | null;
  voterIdFile: File | null;
  aadhaarPreview: string;
  voterIdPreview: string;
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
    mobileNumber: "+91 ",
    aadhaarNumber: "",
    state: "",
    district: "",
  });

  const [documentUpload, setDocumentUpload] = useState<DocumentUpload>({
    aadhaarFile: null,
    voterIdFile: null,
    aadhaarPreview: "",
    voterIdPreview: "",
  });

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
  const [detectionMessage, setDetectionMessage] = useState("Position your face in the center");
  const [faceDetected, setFaceDetected] = useState(false);
  const [currentStage, setCurrentStage] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDistrictFocused, setIsDistrictFocused] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user" as ConstrainDOMString,
        },
        audio: false,
      });
      setCameraStream(stream);
      setCameraActive(true);
      setCurrentStage(1);
      setDetectionMessage("🎥 Camera active. Position your face for Stage 1");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert("❌ Unable to access camera. Please check permissions.");
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

  // Manual capture for stage
  const manualCaptureStage = async (stage: number) => {
    if (!videoRef.current || !displayCanvasRef.current) return;

    try {
      setIsProcessing(true);
      setDetectionMessage(`🔍 Analyzing face for Stage ${stage}...`);

      if (displayCanvasRef.current) {
        // Draw video frame to canvas at full resolution
        const captureCanvas = document.createElement('canvas'); // Create temp canvas for high-res capture
        captureCanvas.width = videoRef.current.videoWidth;
        captureCanvas.height = videoRef.current.videoHeight;

        // Provide visual feedback effect on main display canvas
        const displayCtx = displayCanvasRef.current.getContext("2d");

        displayCanvasRef.current.width = videoRef.current.videoWidth;
        displayCanvasRef.current.height = videoRef.current.videoHeight;

        if (displayCtx) {
          displayCtx.drawImage(videoRef.current, 0, 0);

          // Flash effect
          displayCtx.fillStyle = "white";
          displayCtx.globalAlpha = 0.5;
          displayCtx.fillRect(0, 0, displayCanvasRef.current.width, displayCanvasRef.current.height);
          setTimeout(() => {
            if (displayCanvasRef.current) {
              const ctx = displayCanvasRef.current.getContext("2d");
              if (ctx) {
                ctx.globalAlpha = 1.0;
                ctx.drawImage(videoRef.current!, 0, 0);
              }
            }
          }, 100);
        }

        // Correct capture
        captureCanvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
        const imageData = captureCanvas.toDataURL("image/jpeg", 0.95);

        // Save capture
        setBiometricImages((prev) => ({
          ...prev,
          [`stage${stage}`]: imageData,
        }));

        // Mark stage as captured
        setBiometricData((prev) => ({
          ...prev,
          [`stage${stage}Captured` as keyof BiometricData]: true,
        }));

        setDetectionMessage(`✅ Stage ${stage} captured successfully!`);
        setFaceDetected(true);

        setTimeout(() => {
          setIsProcessing(false);
        }, 1500);
      }
    } catch (error) {
      console.error("Error capturing frame:", error);
      setDetectionMessage("❌ Error during capture. Try again.");
      setIsProcessing(false);
    }
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

  // Ensure stream is attached to video element when it becomes available
  useEffect(() => {
    if (cameraActive && videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraActive, cameraStream]);

  // Lighting Check Function
  const checkBrightness = (video: HTMLVideoElement): boolean => {
    if (!displayCanvasRef.current) return false;
    const ctx = displayCanvasRef.current.getContext("2d");
    if (!ctx) return false;

    // We use a small canvas for performance
    displayCanvasRef.current.width = 100;
    displayCanvasRef.current.height = 100;
    ctx.drawImage(video, 0, 0, 100, 100);
    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;
    let r, g, b, avg;
    let colorSum = 0;

    for (let x = 0, len = data.length; x < len; x += 4) {
      r = data[x];
      g = data[x + 1];
      b = data[x + 2];
      avg = Math.floor((r + g + b) / 3);
      colorSum += avg;
    }

    const brightness = Math.floor(colorSum / (100 * 100));
    return brightness > 40; // Threshold for "too dark"
  };

  // Face Detection Loop
  const processingRef = useRef(false); // Ref to track if capture is in progress to avoid double triggers

  useEffect(() => {
    let animationFrameId: number;
    let localStableCount = 0;

    // Reset processing ref on stage change
    processingRef.current = false;

    const STABILITY_FRAMES = 10;

    // Guard: Don't run detection if we are past stage 4
    if (currentStage > 4) return;

    const detect = async () => {
      // Basic checks
      if (!cameraActive || !videoRef.current || processingRef.current) return;

      // Double check stage inside loop
      if (currentStage > 4) return;

      if (videoRef.current.paused || videoRef.current.ended) {
        animationFrameId = requestAnimationFrame(detect);
        return;
      }

      // Check lighting first
      const isBrightEnough = checkBrightness(videoRef.current);
      if (!isBrightEnough) {
        setDetectionMessage("💡 Lighting is a bit low, but we'll try...");
      }

      try {
        // Detect Face
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks();

        if (detection) {
          const landmarks = detection.landmarks;
          const nose = landmarks.getNose()[3];
          const jaw = landmarks.getJawOutline();
          const jawLeft = jaw[0];
          const jawRight = jaw[16];

          const faceWidth = jawRight.x - jawLeft.x;
          const noseX = nose.x - jawLeft.x;
          const yawRatio = noseX / faceWidth;

          let isPoseCorrect = false;

          // ... Pose logic ...
          if (currentStage === 1) { // Front
            if (yawRatio > 0.35 && yawRatio < 0.65) {
              setDetectionMessage("✅ Perfect! Hold steady...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("Look straight at the camera");
            }
          } else if (currentStage === 2) { // Left
            if (yawRatio < 0.45) {
              setDetectionMessage("✅ Good! Hold...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("⬅️ Turn head LEFT");
            }
          } else if (currentStage === 3) { // Right
            if (yawRatio > 0.55) {
              setDetectionMessage("✅ Good! Hold...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("➡️ Turn head RIGHT");
            }
          } else if (currentStage === 4) { // Up
            if (yawRatio > 0.3 && yawRatio < 0.7) {
              setDetectionMessage("✅ Hold that (Up)...");
              isPoseCorrect = true;
            } else {
              setDetectionMessage("Look up slightly");
            }
          }

          if (isPoseCorrect) {
            setFaceDetected(true);
            localStableCount++;

            if (localStableCount > STABILITY_FRAMES) {
              // Check if already processing or captured
              if (!processingRef.current && !biometricData[`stage${currentStage}Captured` as keyof BiometricData]) {
                processingRef.current = true; // LOCK

                await manualCaptureStage(currentStage);
                localStableCount = 0;

                // Auto-advance
                if (currentStage < 4) {
                  setTimeout(() => {
                    setCurrentStage(prev => Math.min(prev + 1, 4));
                    // processingRef.current will be reset by the effect re-running on stage change
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
  }, [cameraActive, currentStage, biometricData]); // Loop dependencies

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Validation Functions
  const validateFullName = (name: string): boolean => /^[a-zA-Z\s]{2,}$/.test(name);

  const validateAge = (dob: string): boolean => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 18;
  };

  const validateMobileNumber = (mobile: string): boolean => {
    const digits = mobile.replace("+91", "").trim();
    return /^\d{10}$/.test(digits);
  };

  const validateAadhaar = (aadhaar: string): boolean => {
    const digits = aadhaar.replace(/\s/g, "");
    return /^\d{12}$/.test(digits);
  };

  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!validateFullName(personalInfo.fullName)) {
      newErrors.fullName = "Name must contain only letters and spaces (min 2 characters)";
    }
    if (!personalInfo.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!validateAge(personalInfo.dateOfBirth)) {
      newErrors.dateOfBirth = "You must be at least 18 years old";
    }
    if (!validateMobileNumber(personalInfo.mobileNumber)) {
      newErrors.mobileNumber = "Mobile number must be 10 digits (after +91)";
    }
    if (!validateAadhaar(personalInfo.aadhaarNumber)) {
      newErrors.aadhaarNumber = "Aadhaar must be exactly 12 digits";
    }
    if (!personalInfo.state) {
      newErrors.state = "Please select a state";
    }
    if (!personalInfo.district) {
      newErrors.district = "Please select a district";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    return documentUpload.aadhaarFile !== null && documentUpload.voterIdFile !== null;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) {
      alert("Please upload both documents");
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsProcessing(true);
      setDetectionMessage("📤 Registering your biometric data...");

      // Collect the 4 captured face images
      const faceImages = [
        biometricImages.stage1,
        biometricImages.stage2,
        biometricImages.stage3,
        biometricImages.stage4,
      ].filter(Boolean) as string[];

      // Register faces with Python backend
      const userId = personalInfo.aadhaarNumber.replace(/\s/g, "");
      const result = await registerUserFaces(userId, [
        biometricImages.stage1 || "",
        biometricImages.stage2 || "",
        biometricImages.stage3 || "",
        biometricImages.stage4 || "",
      ]);

      if (result.success) {
        setShowSuccess(true);
        setDetectionMessage("✅ Registration completed successfully!");
        console.log("✅ User registered:", {
          personalInfo,
          documentUpload,
          biometricData,
          result,
        });
      } else {
        alert(`❌ Registration failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      alert("Error during registration. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const maskAadhaar = (aadhaar: string) => {
    const digits = aadhaar.replace(/\s/g, "");
    return `XXXX XXXX ${digits.slice(-4)}`;
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "aadhaarFile" | "voterIdFile"
  ) => {
    const file = event.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentUpload((prev) => ({
          ...prev,
          [field]: file,
          [field === "aadhaarFile" ? "aadhaarPreview" : "voterIdPreview"]: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("File size must be less than 5MB");
    }
  };

  return (
    <PageWrapper>
      <Layout>
        <section className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 py-12">
          <div className="container max-w-2xl">
            {/* Header */}
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-blue-500" />
                <h1 className="text-4xl font-black text-white">Register to Vote</h1>
              </div>
              <p className="text-gray-400">Step {currentStep} of 4</p>
            </motion.div>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-12">
              {[1, 2, 3, 4].map((step) => (
                <motion.div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all ${step < currentStep
                    ? "bg-green-500"
                    : step === currentStep
                      ? "bg-blue-500"
                      : "bg-neutral-700"
                    }`}
                  animate={{ scale: step === currentStep ? 1.05 : 1 }}
                />
              ))}
            </div>

            {/* Success Message */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500 rounded-xl p-8 mb-8 text-center"
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-400 mb-2">Registration Successful! ✅</h2>
                <p className="text-green-300 mb-6">
                  Your facial biometric has been registered and will be used for future authentication.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = "/"}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Go to Home
                </motion.button>
              </motion.div>
            )}

            {!showSuccess && (
              <AnimatePresence mode="wait">
                {/* STEP 1: Personal Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-8 space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-8">Personal Information</h2>

                    {/* Full Name */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Full Name</label>
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^[a-zA-Z\s]*$/.test(value)) {
                            setPersonalInfo({ ...personalInfo, fullName: value });
                            setErrors({ ...errors, fullName: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.fullName ? "border-red-500" : "border-neutral-700"
                          } text-white placeholder-gray-500 focus:outline-none focus:border-blue-500`}
                        placeholder="Enter full name (as per Aadhaar)"
                      />
                      {errors.fullName && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={personalInfo.dateOfBirth}
                        onChange={(e) => {
                          setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value });
                          setErrors({ ...errors, dateOfBirth: "" });
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.dateOfBirth ? "border-red-500" : "border-neutral-700"
                          } text-white focus:outline-none focus:border-blue-500`}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={personalInfo.mobileNumber}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.startsWith("+91") && /^[+91\d\s]*$/.test(value)) {
                            setPersonalInfo({ ...personalInfo, mobileNumber: value });
                            setErrors({ ...errors, mobileNumber: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.mobileNumber ? "border-red-500" : "border-neutral-700"
                          } text-white focus:outline-none focus:border-blue-500`}
                        placeholder="+91 XXXXXXXXXX"
                      />
                      {errors.mobileNumber && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.mobileNumber}
                        </p>
                      )}
                    </div>

                    {/* Aadhaar Number */}
                    <div>
                      <label className="block text-white font-semibold mb-2">Aadhaar Number</label>
                      <p className="text-sm text-gray-400 mb-2">12-digit number (will be masked)</p>
                      <input
                        type="text"
                        value={personalInfo.aadhaarNumber}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, "");
                          if (value.length <= 12) {
                            // Format as XXXX XXXX XXXX
                            if (value.length > 8) {
                              value = `${value.slice(0, 4)} ${value.slice(4, 8)} ${value.slice(8)}`;
                            } else if (value.length > 4) {
                              value = `${value.slice(0, 4)} ${value.slice(4)}`;
                            }
                            setPersonalInfo({ ...personalInfo, aadhaarNumber: value });
                            setErrors({ ...errors, aadhaarNumber: "" });
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.aadhaarNumber ? "border-red-500" : "border-neutral-700"
                          } text-white focus:outline-none focus:border-blue-500`}
                        placeholder="XXXX XXXX XXXX"
                      />
                      {errors.aadhaarNumber && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.aadhaarNumber}
                        </p>
                      )}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-white font-semibold mb-2">State</label>
                      <select
                        value={personalInfo.state}
                        onChange={(e) => {
                          setPersonalInfo({ ...personalInfo, state: e.target.value, district: "" });
                          setErrors({ ...errors, state: "" });
                        }}
                        className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.state ? "border-red-500" : "border-neutral-700"
                          } text-white focus:outline-none focus:border-blue-500`}
                      >
                        <option value="">Select State</option>
                        {INDIAN_STATES.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                      {errors.state && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.state}
                        </p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-white font-semibold mb-2">District</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={personalInfo.district}
                          onFocus={() => setIsDistrictFocused(true)}
                          onBlur={() => setTimeout(() => setIsDistrictFocused(false), 200)}
                          onChange={(e) => {
                            setPersonalInfo({ ...personalInfo, district: e.target.value });
                            setErrors({ ...errors, district: "" });
                          }}
                          placeholder="Type or select district"
                          disabled={!personalInfo.state}
                          className={`w-full px-4 py-3 rounded-lg bg-neutral-800 border ${errors.district ? "border-red-500" : "border-neutral-700"
                            } text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50`}
                        />
                        {personalInfo.state && isDistrictFocused && DISTRICTS[personalInfo.state] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-neutral-800 border border-neutral-700 rounded-lg max-h-48 overflow-y-auto z-10 shadow-lg">
                            {DISTRICTS[personalInfo.state]
                              ?.filter((d) =>
                                d.toLowerCase().includes(personalInfo.district.toLowerCase())
                              )
                              .map((district) => (
                                <button
                                  key={district}
                                  type="button"
                                  onClick={() => {
                                    setPersonalInfo({ ...personalInfo, district });
                                    setErrors({ ...errors, district: "" });
                                  }}
                                  className="w-full px-4 py-2 text-left text-white hover:bg-neutral-700 transition-colors text-sm"
                                >
                                  {district}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                      {errors.district && (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {errors.district}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Document Upload */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-8 space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-8">Document Verification</h2>

                    {/* Aadhaar Upload */}
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                      <p className="text-blue-300 font-semibold mb-2">📄 Aadhaar Card</p>
                      <p className="text-sm text-blue-200">
                        Upload a clear image of your Aadhaar card (front side). File size up to 5MB.
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        id="aadhaar-upload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "aadhaarFile")}
                        className="hidden"
                      />
                      <label
                        htmlFor="aadhaar-upload"
                        className="block border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        {documentUpload.aadhaarFile ? (
                          <div className="space-y-3">
                            {documentUpload.aadhaarPreview && (
                              <img
                                src={documentUpload.aadhaarPreview}
                                alt="Aadhaar"
                                className="w-full max-w-sm rounded-lg border border-green-500 mx-auto"
                              />
                            )}
                            <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-5 w-5" />
                              {documentUpload.aadhaarFile.name}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                            <p className="text-white font-semibold">Click to upload Aadhaar</p>
                            <p className="text-gray-400 text-sm">or drag and drop</p>
                          </div>
                        )}
                      </label>
                    </div>

                    {/* Voter ID Upload */}
                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6 mt-8">
                      <p className="text-blue-300 font-semibold mb-2">🪪 Voter ID</p>
                      <p className="text-sm text-blue-200">
                        Upload a clear image of your Voter ID. File size up to 5MB.
                      </p>
                    </div>

                    <div className="relative">
                      <input
                        type="file"
                        id="voterid-upload"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "voterIdFile")}
                        className="hidden"
                      />
                      <label
                        htmlFor="voterid-upload"
                        className="block border-2 border-dashed border-neutral-700 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        {documentUpload.voterIdFile ? (
                          <div className="space-y-3">
                            {documentUpload.voterIdPreview && (
                              <img
                                src={documentUpload.voterIdPreview}
                                alt="Voter ID"
                                className="w-full max-w-sm rounded-lg border border-green-500 mx-auto"
                              />
                            )}
                            <p className="text-green-400 font-semibold flex items-center justify-center gap-2">
                              <CheckCircle2 className="h-5 w-5" />
                              {documentUpload.voterIdFile.name}
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                            <p className="text-white font-semibold">Click to upload Voter ID</p>
                            <p className="text-gray-400 text-sm">or drag and drop</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Biometric Capture */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-8 space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-8">Facial Biometric Enrollment</h2>

                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-6">
                      <p className="text-blue-300 font-semibold mb-2">🔐 Face Recognition Training</p>
                      <p className="text-sm text-blue-200">
                        We'll capture your face in 4 different angles. This creates your unique facial signature for authentication.
                      </p>
                    </div>

                    {!cameraActive ? (
                      <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-neutral-700 aspect-video flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                          <p className="text-gray-400 mb-4">Camera not active</p>
                          <button
                            onClick={startCamera}
                            disabled={isProcessing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto disabled:opacity-50"
                          >
                            <Camera className="h-5 w-5" />
                            Start Camera
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-full bg-black rounded-xl overflow-hidden border-2 border-blue-500 aspect-video flex items-center justify-center">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full object-cover"
                        />

                        {/* Face detection guide overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className={`w-40 h-48 border-4 rounded-full transition-colors ${faceDetected ? "border-green-500 shadow-lg shadow-green-500/50" : "border-blue-500/50"
                            }`} />
                        </div>

                        {/* Status indicator */}
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${faceDetected ? "bg-green-500" : "bg-orange-500"} animate-pulse`} />
                          <span className="text-white text-sm font-semibold">
                            {faceDetected ? "✓ Face Ready" : "Waiting..."}
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 space-y-2">
                          <p className="text-white font-bold text-lg">Stage {currentStage} of 4</p>
                          <p className={`text-lg font-semibold ${faceDetected ? "text-green-400" : "text-orange-400"}`}>
                            {currentStage === 1 && "📷 Look straight at camera"}
                            {currentStage === 2 && "⬅️ Turn head slightly LEFT"}
                            {currentStage === 3 && "➡️ Turn head slightly RIGHT"}
                            {currentStage === 4 && "⬆️ Tilt head slightly UP"}
                          </p>
                          <p className="text-gray-300 text-sm">{detectionMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Camera controls */}
                    <div className="flex gap-3 justify-center">
                      {!cameraActive ? (
                        <button
                          onClick={startCamera}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Camera className="h-5 w-5" />
                          Start Camera
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => manualCaptureStage(currentStage)}
                            disabled={isProcessing || biometricData[`stage${currentStage}Captured` as keyof BiometricData]}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                          >
                            <Zap className="h-5 w-5" />
                            {isProcessing ? "Capturing..." : `Capture Stage ${currentStage}`}
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                          >
                            Stop Camera
                          </button>
                        </>
                      )}
                    </div>

                    {/* Stage progress */}
                    <div className="grid grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((stage) => (
                        <div
                          key={stage}
                          className={`p-3 rounded-lg border-2 text-center transition-all ${biometricData[`stage${stage}Captured` as keyof BiometricData]
                            ? "border-green-500 bg-green-500/10"
                            : currentStage === stage
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-neutral-700 bg-neutral-800/50"
                            }`}
                        >
                          <div className="flex items-center justify-center h-12 mb-2">
                            {biometricData[`stage${stage}Captured` as keyof BiometricData] &&
                              biometricImages[`stage${stage}` as keyof typeof biometricImages] ? (
                              <img
                                src={biometricImages[`stage${stage}` as keyof typeof biometricImages]!}
                                alt={`Stage ${stage}`}
                                className="w-12 h-12 rounded object-cover"
                              />
                            ) : (
                              <span className="text-2xl">
                                {stage === 1 && "📷"}
                                {stage === 2 && "⬅️"}
                                {stage === 3 && "➡️"}
                                {stage === 4 && "⬆️"}
                              </span>
                            )}
                          </div>
                          <p className={`text-xs font-semibold ${biometricData[`stage${stage}Captured` as keyof BiometricData]
                            ? "text-green-400"
                            : currentStage === stage
                              ? "text-blue-400"
                              : "text-gray-400"
                            }`}>
                            Stage {stage}
                          </p>
                          {biometricData[`stage${stage}Captured` as keyof BiometricData] && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mt-1" />
                          )}
                        </div>
                      ))}
                    </div>

                    {biometricData.stage1Captured &&
                      biometricData.stage2Captured &&
                      biometricData.stage3Captured &&
                      biometricData.stage4Captured && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-green-500/10 border border-green-500/50 rounded-lg p-4"
                        >
                          <p className="text-green-300 flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="h-5 w-5" />
                            All biometric stages captured successfully!
                          </p>
                        </motion.div>
                      )}

                    <canvas ref={displayCanvasRef} className="hidden" />
                  </motion.div>
                )}

                {/* STEP 4: Review & Submit */}
                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-neutral-800/50 border border-neutral-700 rounded-xl p-8 space-y-6"
                  >
                    <h2 className="text-2xl font-bold text-white mb-8">Review & Submit</h2>

                    {/* Personal Info Summary */}
                    <div className="bg-neutral-800/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white mb-4">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Full Name</p>
                          <p className="text-white font-semibold">{personalInfo.fullName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Date of Birth</p>
                          <p className="text-white font-semibold">{personalInfo.dateOfBirth}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Mobile Number</p>
                          <p className="text-white font-semibold">{personalInfo.mobileNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Aadhaar (Masked)</p>
                          <p className="text-white font-semibold">{maskAadhaar(personalInfo.aadhaarNumber)}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">State</p>
                          <p className="text-white font-semibold">{personalInfo.state}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">District</p>
                          <p className="text-white font-semibold">{personalInfo.district}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documents Summary */}
                    <div className="bg-neutral-800/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white mb-4">Documents</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Aadhaar Card</p>
                          <p className="text-white font-semibold">{documentUpload.aadhaarFile?.name}</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">Voter ID</p>
                          <p className="text-white font-semibold">{documentUpload.voterIdFile?.name}</p>
                        </div>
                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                      </div>
                    </div>

                    {/* Biometric Summary */}
                    <div className="bg-neutral-800/50 rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-bold text-white mb-4">Biometric Data</h3>
                      <div className="grid grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((stage) => (
                          <div key={stage} className="text-center">
                            <div className="flex items-center justify-center h-16 mb-2 bg-neutral-900 rounded-lg">
                              {biometricImages[`stage${stage}` as keyof typeof biometricImages] ? (
                                <img
                                  src={biometricImages[`stage${stage}` as keyof typeof biometricImages]!}
                                  alt={`Stage ${stage}`}
                                  className="w-14 h-14 rounded object-cover"
                                />
                              ) : (
                                <span className="text-2xl">❌</span>
                              )}
                            </div>
                            <p className="text-green-400 text-xs font-semibold">
                              {biometricData[`stage${stage}Captured` as keyof BiometricData] ? "✓" : "✗"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                      <p className="text-blue-300 text-sm">
                        By submitting, you confirm that all information is accurate and authorize the use of your biometric data for voter authentication.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Navigation Buttons */}
            {!showSuccess && (
              <div className="flex gap-4 mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handlePreviousStep}
                  disabled={currentStep === 1}
                  className="flex-1 px-6 py-3 border border-neutral-700 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                  Previous
                </motion.button>

                {currentStep < 4 ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleNextStep}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={handleSubmit}
                    disabled={isProcessing || !biometricData.stage1Captured || !biometricData.stage2Captured || !biometricData.stage3Captured || !biometricData.stage4Captured}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isProcessing ? "Registering..." : "Submit Registration"}
                    <CheckCircle2 className="h-5 w-5" />
                  </motion.button>
                )}
              </div>
            )}
          </div>
        </section>
      </Layout>
    </PageWrapper>
  );
}
