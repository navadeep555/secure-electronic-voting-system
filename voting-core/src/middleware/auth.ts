// import { Request, Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";

// export const verifyVoterJWT = (req: any, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ 
//       success: false, 
//       message: "Access Denied: No authentication token provided." 
//     });
//   }

//   try {
//     const secret = process.env.JWT_SECRET || "your_shared_secret";
//     const decoded = jwt.verify(token, secret);
    
//     // US2.6: We attach the decoded payload (containing userIdHash) 
//     // so the route can mark the user as 'voted' in the DB
//     req.user = decoded; 
//     next();
//   } catch (error) {
//     console.error("JWT Verification Error:", error);
//     return res.status(403).json({ 
//       success: false, 
//       message: "Invalid or expired session. Please re-authenticate." 
//     });
//   }
// };

import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Ensure this matches your Python secret exactly
const JWT_SECRET = process.env.JWT_SECRET || "your_shared_secret";



/**
 * Standard JWT Verification for Voters
 */
export const verifyVoterJWT = (req: any, res: Response, next: NextFunction) => {
  // ADD THIS LOG TEMPORARILY
  console.log("SERVER ATTEMPTING VERIFY WITH KEY:", JWT_SECRET);
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  console.log("RECEIVED TOKEN STRING:", token);
  if (!token) {
    return res.status(401).json({ success: false, message: "Access Denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("JWT Error:", error.message); 
    return res.status(403).json({ 
      success: false, 
      message: "Invalid session",
      details: error.message 
    });
  }
};

/**
 * Role-Based Authorization for Admins
 * This was missing from your last snippet!
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // 1. Check if verifyVoterJWT (or similar) already put the user on the req
    // If not, we extract it here
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Check if the user's role (from Python JWT) matches allowedRoles
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ 
          success: false, 
          message: "Forbidden: Insufficient permissions." 
        });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};