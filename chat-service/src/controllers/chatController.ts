import { Request, Response, NextFunction } from "express";
import ChatModel from "../models/Chat";
import logger from "../utils/logger";
export const createOrGetChat = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const myId = req.headers["x-user-id"] as string;
    const userId = req.params.userId as string;
    if (!myId || !userId) {
      return res.status(400).json({ message: "both ids are requred" });
    }

    let chat = await ChatModel.findOne({
      participants: { $all: [myId, userId] },
    });

    if (chat) {
      return res.status(200).json({ message: "chat found", chat });
    }

    chat = await ChatModel.create({
      participants: [myId, userId],
    });
    res.status(200).json({ message: "chat created", chat });
  } catch (error) {
    logger.error(`error in createOrGetChat: ${error}`);
    next(error);
  }
};

export const getMyChats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const myId = req.headers["x-user-id"] as string;
    const chats = await ChatModel.find({ participants: myId }).sort({
      lastMessageAt: -1,
    });
    res.status(200).json({ message: "foundchats", chats });
  } catch (error) {
    logger.error(`error in getMyChats: ${error}`);
    next(error);
  }
};
