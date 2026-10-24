import { NextFunction, Request, Response } from "express";
import profileModel from "../models/UserProfile";
import logger from "../utils/logger";
import cloudinary from "../config/cloudinary";
import { upload } from "../config/multer";
import { Readable } from "stream";
import redis from "../config/redis";
export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const profile = await profileModel.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: "profile not found" });
    }
    res.status(200).json({ message: "profile found", profile });
  } catch (error: any) {
    logger.error(`error in get profile worker ${error}`);
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    const { userName, bio } = req.body;
    const profile = await profileModel.findOneAndUpdate(
      { userId },
      { userName, bio },
      { new: true },
    );
    if (!profile) {
      return res
        .status(404)
        .json({ message: "profile not found in update profile" });
    }
    res.status(200).json({ message: "profile updated", profile });
  } catch (error) {
    logger.error(`error in update profile worked ${error}`);
   res.status(500).json({messaage:"internal server error"})
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'nexchat/avatars',
          public_id: `avatar_${userId}`,
          overwrite: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      Readable.from(file.buffer).pipe(uploadStream);
    });

    const avatarUrl = (uploadResult as any).secure_url;

   
    const profile = await profileModel.findOneAndUpdate(
      { userId },
      { avatar: avatarUrl },
      { new: true }
    );

    res.status(200).json({ message: 'Avatar updated', avatar: avatarUrl, profile });

  } catch (error) {
    logger.error(`error in update avatar: ${error}`);
    next(error);
  }
};

export const searchUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    const q = req.query.q as string;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await profileModel.find({
      userName: { $regex: q, $options: 'i' }, 
      userId: { $ne: userId } 
    }).limit(20);

    const usersWithStatus = await Promise.all(users.map(async (u: any) => {
      const status = await redis.get(`user:online:${u.userId}`);
      return { ...u._doc, isOnline: status === '1' };
    }));

    res.status(200).json({ users: usersWithStatus });

  } catch (error) {
    logger.error(`error in search users: ${error}`);
    next(error);
  }
};

export const getUserStatus = async(req: Request, res: Response, next: NextFunction)=>{
  try {
    const {userId} = req.params
    const status = await redis.get(`user:online${userId}`)
    res.status(200).json({userId, isOnline:status==='1'})

    
  } catch (error) {
    logger.error(`catch in get userstatus worked ${error}`)
    next(error)
    
  }

}

export const getBulkStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: 'userIds array is required' });
    }

    const keys = userIds.map((id: string) => `user:online:${id}`);
    const statuses = await redis.mget(...keys);

    const result: Record<string, boolean> = {};
    userIds.forEach((id: string, index: number) => {
      result[id] = statuses[index] === '1';
    });

    res.status(200).json({ statuses: result });

  } catch (error) {
    logger.error(`error in bulk status: ${error}`);
    next(error);
  }
};

export const getBulkProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({ message: "userIds array is required" });
    }

    const profiles = await profileModel.find({ userId: { $in: userIds } });
    
    // Hydrate with online status from Redis
    const keys = userIds.map((id: string) => `user:online:${id}`);
    const statuses = await redis.mget(...keys);
    
    const hydratedProfiles = profiles.map((p: any) => {
      const index = userIds.indexOf(p.userId);
      return {
        ...p._doc,
        isOnline: index !== -1 && statuses[index] === '1'
      };
    });

    res.status(200).json({ message: "profiles found", profiles: hydratedProfiles });
  } catch (error: any) {
    logger.error(`error in get bulk profiles: ${error}`);
    next(error);
  }
};