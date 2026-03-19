import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization
    if(!authHeader || authHeader.startsWith("bearer")){
        res.status(401).json({message:"unAuthorized"})
    }

    const token = authHeader?.split(" ")[1]
      if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
        req.headers['x-user-id'] = (decoded as any).userId
        next()
        
    } catch (error) {
        console.log("error in auth middleware api gateway");
        res.status(401).json({message:"invalid token", error:error})
        
        
    }
}