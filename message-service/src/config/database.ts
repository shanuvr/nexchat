import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("mongo uri not defined");
    await mongoose.connect(uri);
    logger.info("Database connected in Message Service successfully");
  } catch (error) {
    logger.error("Error connecting to database in Message Service:", error);
    process.exit(1);
  }
};
