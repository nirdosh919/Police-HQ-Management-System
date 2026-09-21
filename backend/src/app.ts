import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import Officer from "./models/Officer";

import officerRoutes from "./routes/officer.routes";
import departmentRoutes from "./routes/department.routes";
import authRoutes from "./routes/auth.routes";
import auditRoutes from "./routes/audit.routes";
import { authenticate } from "./middleware/auth.middleware";
import { requireManagementWrite } from "./middleware/managementWrite.middleware";
import { auditRequest } from "./middleware/audit.middleware";

import attendanceRoutes from "./routes/attendance.routes";
import reportRoutes from "./routes/report.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import headquartersRoutes from "./routes/headquarters.routes";
import policeStationRoutes from "./routes/policeStation.routes";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5000",
          "http://127.0.0.1:5000",
          "https://police-hq-management-backend.onrender.com",
        ],

        connectSrc: [
          "'self'",
          "http://localhost:5000",
          "http://127.0.0.1:5000",
          "https://police-hq-management-backend.onrender.com",
        ],

        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],

        styleSrc: ["'self'", "'unsafe-inline'", "https:"],

        fontSrc: ["'self'", "data:", "https:"],

        objectSrc: ["'none'"],
      },
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://police-hq-management-system.vercel.app",
      ];

      // Allow requests with no origin and allowed frontend origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Police HQ Management System API",
    version: "1.0.0",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Police HQ API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.use("/api/auth", authRoutes);

app.use(
  "/api/officers",
  authenticate,
  requireManagementWrite,
  auditRequest,
  officerRoutes
);

app.use(
  "/api/departments",
  authenticate,
  requireManagementWrite,
  auditRequest,
  departmentRoutes
);

app.use("/api/audit", authenticate, auditRoutes);

app.use(
  "/api/attendance",
  authenticate,
  attendanceRoutes
);

app.use(
  "/api/reports",
  authenticate,
  auditRequest,
  reportRoutes
);

app.use(
  "/api/dashboard",
  authenticate,
  auditRequest,
  dashboardRoutes
);

app.use(
  "/api/headquarters",
  authenticate,
  requireManagementWrite,
  auditRequest,
  headquartersRoutes
);

app.use(
  "/api/police-stations",
  authenticate,
  requireManagementWrite,
  auditRequest,
  policeStationRoutes
);

export default app;