import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/User";
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const hashpass = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      email,
      password: hashpass,
    });
    res.status(201).json({message:"user registerd successfully", user:user})
  } catch (error) {
    console.log("error in register", error);
    res.status(500).json({ message: "internal server error ", error: error });
  }
};
