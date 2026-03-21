import "dotenv/config";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { authLimiter,generalRateLimiter } from "./middleware/rateLimiter";
import morgan from "morgan";
import { authMiddleware } from "./middleware/auth";

const app = express();

app.use(morgan("dev"));
app.use(generalRateLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api gateway" });
});
app.use(
  "/api/auth",
  authLimiter,
  createProxyMiddleware({
    target: `http://localhost:3001`,
    changeOrigin: true,
  }),
);
app.use(
  "/api/users",
  authMiddleware,
  createProxyMiddleware({
    target: `http://localhost:3002`,
    changeOrigin: true,
  }),
);
app.use(
  "/api/chats",
  authMiddleware,
  createProxyMiddleware({
    target: `http://localhost:3003`,
    changeOrigin: true,
  }),
);
app.use(
  "/api/messages",
  authMiddleware,
  createProxyMiddleware({
    target: `http://localhost:3004`,
    changeOrigin: true,
  }),
);

export default app;
