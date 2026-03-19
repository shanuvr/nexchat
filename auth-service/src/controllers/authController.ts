import { Request,Response,NextFunction } from "express";
export const register = async(req:Request,res:Response)=>{
    try {
        console.log("reached here");
        
        res.json({message:"reached here"})
        
        
    } catch (error) {
        
    }
}