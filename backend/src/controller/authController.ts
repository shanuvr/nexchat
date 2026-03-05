import { clerkClient, getAuth } from "@clerk/express";
import type { AuthRequest } from "../middleware/auth";
import type { Response } from "express";
import { UserModel } from "../models/User";
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await UserModel.findOne({ userId });

    if (!user) return res.status(404).json({ message: "user not found" });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const callback = async(req:AuthRequest,res:Response)=>{
    try{
        const auth =  getAuth(req)
        const clerkId = auth.userId
        if(!clerkId){
            return res.status(401).json({message:"unauthorized"})
        }
        let user = await UserModel.findOne({clerkId})
         if(!user){
            const clerkUser = await clerkClient.users.getUser(clerkId)
            user = await UserModel.create({
                clerkId,
                name:clerkUser.firstName? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim(): clerkUser.emailAddresses[0]?.emailAddress.split("@")[0]||"user",
                email:clerkUser.emailAddresses[0]?.emailAddress
            })
            res.status(200).json({user})

         }




    }catch(err){
         res.status(500).json({message:"interneal server error"})
    }
    
}
