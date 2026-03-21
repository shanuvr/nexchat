import mongoose from "mongoose";
import logger from "../utils/logger";

export const connectDb = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("mongo uri not defined");
    await mongoose.connect(uri);
    logger.info("database connected in Auth Service succesfully");
  } catch (error) {
    logger.error("erro connection databse", error);
    process.exit(1);
  }
};
