import express from "express";
import {
  googleAuth,
  login,
  logout,
  refresh,
  register,
} from "../controllers/authController";
import { loginSchema, registerSchema, validate } from "../middleware/validate";
const authRouter = express.Router();
authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.post("/google", googleAuth);
export default authRouter;
