import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { UserModel } from "../models/User";
import { requireAuth } from "@clerk/express";
export type AuthRequest = Request & {
  userId?: string;
};
export const protectedRoute = [
  requireAuth(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const auth = getAuth(req);
      const clerkId = auth.userId;
      if (!clerkId) return res.status(401).json({ message: "Unauthorized" });
      const user = await UserModel.findOne({ clerkId });
      if (!user) return res.status(401).json({ message: "user not found" });
      req.userId = user._id.toString();
      next();
    } catch (Err) {
        
    }
  },
];
