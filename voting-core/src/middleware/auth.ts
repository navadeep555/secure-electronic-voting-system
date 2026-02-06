import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const verifyVoterJWT = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Access Denied: No authentication token provided." 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "your_shared_secret";
    const decoded = jwt.verify(token, secret);
    
    // US2.6: We attach the decoded payload (containing userIdHash) 
    // so the route can mark the user as 'voted' in the DB
    req.user = decoded; 
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired session. Please re-authenticate." 
    });
  }
};