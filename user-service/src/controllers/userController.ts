import { NextFunction, Request, Response } from "express";
import profileModel from "../models/UserProfile";
import logger from "../utils/logger";
import cloudinary from "../config/cloudinary";
import { upload } from "../config/multer";
import { Readable } from "stream";
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
    const { username, bio } = req.body;
    const profile = await profileModel.findOneAndUpdate(
      { userId },
      { username, bio },
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
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const users = await profileModel.find({
      username: { $regex: q, $options: 'i' }, 
      userId: { $ne: userId } 
    }).limit(20);

    res.status(200).json({ users });

  } catch (error) {
    logger.error(`error in search users: ${error}`);
    next(error);
  }
};