import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { getJwtSecret } from "./middleware/requireAuth";
import { globalLimiter } from "./middleware/rateLimiter";

// Load environment variables (.env from cwd and optionally server/.env if running from root)
dotenv.config();
const serverEnvPath = path.resolve(process.cwd(), "server", ".env");
if (fs.existsSync(serverEnvPath)) {
  dotenv.config({ path: serverEnvPath }); 
}

// Ensure critical secrets are configured at startup
getJwtSecret();

const app = express();
const PORT = Number(process.env.PORT) || 5050;
const HOST = process.env.HOST || "0.0.0.0";

// Configure trust proxy via env if behind a proxy
if (process.env.TRUST_PROXY) {
  const tp = process.env.TRUST_PROXY.trim().toLowerCase();
  if (tp === "true" || tp === "1") {
    app.set("trust proxy", true);
  } else if (!isNaN(Number(tp))) {
    app.set("trust proxy", Number(tp));
  } else {
    app.set("trust proxy", process.env.TRUST_PROXY);
  }
}

// Security headers with Helmet defaults
app.use(helmet());

// CORS Configuration
const rawClientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const clientOrigins = rawClientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultLocalOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5050",
  "http://127.0.0.1:5050",
];

const allowedOrigins = Array.from(new Set([...clientOrigins, ...defaultLocalOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, same-origin/internal server calls)
      if (!origin) return callback(null, true);

      const cleanOrigin = origin.replace(/\/+$/, "");
      if (
        allowedOrigins.includes(cleanOrigin) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parser with safe payload limits
app.use(express.json({ limit: "100kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Root Server Info Endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "Pehalwan Karahi & Bar B Q API",
    version: "1.0.0",
    health: "/api/health",
    documentation: {
      menu: "/api/menu",
      orders: "/api/orders",
      reservations: "/api/reservations",
      loyalty: "/api/loyalty",
      settings: "/api/settings",
      stats: "/api/stats",
      auth: "/api/auth",
    },
  });
});

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Pehalwan Karahi & Bar B Q API",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Mount API Routes with global rate limiting
app.use("/api", globalLimiter, apiRoutes);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found",
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server listening on 0.0.0.0
export const server = app.listen(PORT, HOST, () => {
  console.log(`
  ======================================================
  🔥 PEHALWAN KARAHI & DERA GHAR — EXPRESS BACKEND 🔥
  ======================================================
  🚀 Host:             ${HOST}
  🚪 Port:             ${PORT}
  📡 API Base URL:     http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api
  🥘 Menu Endpoint:    http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api/menu
  🧾 Orders Endpoint:  http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api/orders
  📅 Dawat Bookings:   http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api/reservations
  👑 Shahi Loyalty:    http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api/loyalty
  ❤️ Health Check:     http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}/api/health
  🌐 Allowed Origins:  ${allowedOrigins.join(", ")}
  ======================================================
  `);
});

// Graceful shutdown handling for container/process managers
process.on("SIGTERM", () => {
  console.log("[Express] SIGTERM received. Gracefully shutting down HTTP server...");
  server.close(() => {
    console.log("[Express] HTTP server closed.");
  });
});

process.on("SIGINT", () => {
  console.log("[Express] SIGINT received. Shutting down HTTP server...");
  server.close(() => {
    console.log("[Express] HTTP server closed.");
  });
});

export { app };
export default app;
