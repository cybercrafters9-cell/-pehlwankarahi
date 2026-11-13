import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// Middlewares
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Pehalwan Karahi & Bar B Q API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes
app.use("/api", apiRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found. Available routes: /api/menu, /api/orders, /api/reservations, /api/loyalty",
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
export const server = app.listen(Number(PORT), "127.0.0.1", () => {
  console.log(`
  ======================================================
  🔥 PEHALWAN KARAHI & DERA GHAR — EXPRESS BACKEND 🔥
  ======================================================
  🚀 Server running on: http://localhost:${PORT}
  📡 API Base URL:     http://localhost:${PORT}/api
  🥘 Menu Endpoint:    http://localhost:${PORT}/api/menu
  🧾 Orders Endpoint:  http://localhost:${PORT}/api/orders
  📅 Dawat Bookings:   http://localhost:${PORT}/api/reservations
  👑 Shahi Loyalty:    http://localhost:${PORT}/api/loyalty
  ❤️ Health Check:     http://localhost:${PORT}/api/health
  ======================================================
  `);
});

export { app };
export default app;
