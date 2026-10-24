import { Request, Response, NextFunction } from "express";
import messageModel from "../models/Message";
import logger from "../utils/logger";
import { publishEvent } from "../utils/rabbitmq";
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const senderId = req.headers["x-user-id"] as string;
    const { chatId, text, receiverId } = req.body;
    if (!chatId || !text) {
      return res.status(400).json({ message: "chat id and text are required" });
    }
    const message = await messageModel.create({
      chatId,
      senderId,
      text,
      status: "sent",
    });
    await publishEvent("message.sent", {
      chatId,
      senderId,
      message,
      receiverId:req.body.receiverId
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (error) {
    logger.error(`error in sendMessage: ${error}`);
    next(error);
  }
};

export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const messages = await messageModel
      .find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await messageModel.countDocuments({ chatId });

    res.status(200).json({
      messages,
      totalCount: total,
      hasmore: total > page * limit,
    });
  } catch (error) {
    logger.error(`error in getMessages: ${error}`);
    next(error);
  }
};
