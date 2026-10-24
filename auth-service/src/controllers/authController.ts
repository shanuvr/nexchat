import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import userModel from "../models/User";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import { publishEvent } from "../utils/rabbitmq";
import { OAuth2Client } from "google-auth-library";
import logger from "../utils/logger";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const hashpass = await bcrypt.hash(password, 10);

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    const user = await userModel.create({
      name,
      email,
      password: hashpass,
    });

    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    await publishEvent("user.registered", {
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      message: "user registerd successfully",
      accessToken,
      refreshToken,
      user: user,
    });
  } catch (error) {
    console.log("error in register", error);
    res.status(500).json({ message: "internal server error ", error: error });
  }
};

export const login = async (req: Request, res: Response) => {
  logger.info("reached login")
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) return res.status(404).json({ message: "user not found" });
    if (!user.password) {
  return res.status(400).json({
    message: "This account uses Google login. Please sign in with Google.",
  });
}
    const pass = await bcrypt.compare(password, user.password);
    if (!pass) return res.status(401).json({ message: "invalid password" });
    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    await userModel.findByIdAndUpdate(user._id, { refreshToken });
    res.status(200).json({
      message: "logged in sccuess fully...",
      accessToken,
      refreshToken,
      userId:user._id.toString(),
      sucess: true,
    });
  } catch (error) {
    console.log("error in login", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "refresh token missing" });
    const decoded = verifyRefreshToken(refreshToken) as { userId: string };
    const user = await userModel.findById(decoded.userId);
    if (!user || user.refreshToken != refreshToken) {
      return res.status(401).json({ message: "invalid refresh token" });
    }
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString(),
    );
    await userModel.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken,
    });
    res
      .status(200)
      .json({ message: "created new token", accessToken, refreshToken });
  } catch (error) {
    console.log("error in refresh", error);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.headers["x-user-id"] as string;
    await userModel.findByIdAndUpdate(userId, { refreshToken: null });
    res.status(200).json({ message: "logged out sccuess fully" });
  } catch (error) {
    console.log("error in logout", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;

    // 🔹 Validate input
    if (!idToken) {
      return res.status(400).json({ message: "idToken missing" });
    }

    // 🔹 Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // 🔹 Extract user data from Google
    const email = payload.email!;
    const name = payload.name!;
    const picture = payload.picture!;
    const googleId = payload.sub;

    // 🔹 Check if user exists
    let user: any = await userModel.findOne({ email });

    // 🔹 Create user if not exists
    if (!user) {
      user = await userModel.create({
        name,
        email,
        password: null, // Google users don't have password
        googleId,
        avatar: picture,
      });

      // 🔹 Publish event (optional but good for microservices)
      await publishEvent("user.registered", {
        userId: user._id.toString(),
        email: user.email,
      });
    }

    // 🔹 Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      user._id.toString()
    );

    // 🔹 Save refresh token
    await userModel.findByIdAndUpdate(user._id, { refreshToken });

    // 🔹 Send response
    res.status(200).json({
      message: "Google login success",
      accessToken,
      refreshToken,
      user,
    });

  } catch (error) {
    console.log("error in googleAuth", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};