/**
 * AI-Based Customer Communication Analysis and Risk Alert System
 * Backend (Module 1) - Express server entry point.
 * Run: node server.js (ensure MongoDB is running or .env has Atlas URI)
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const customerRoutes = require("./routes/customerRoutes");
const slaRoutes = require("./routes/slaRoutes");
const projectRoutes = require("./routes/projectRoutes");
const domainRoutes = require("./routes/domainRoutes");
const communicationRoutes = require("./routes/communicationRoutes");
const authRoutes = require("./routes/authRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

const cookieParser = require("cookie-parser");
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,
  "http://localhost:5173",
  "http://localhost:5174",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients and same-origin requests without Origin header.
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/slas", slaRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/domains", domainRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/alerts", alertRoutes);

app.get("/", (req, res) => {
  res.json({
    app: "AI-Based Customer Communication Analysis and Risk Alert System",
    module: "Backend Module 1",
    endpoints: {
      customers: "/api/customers",
      slas: "/api/slas",
      projects: "/api/projects",
      domains: "/api/domains",
      communications: "/api/communications",
      uploadEmail: "POST /api/communications/email",
      uploadTranscript: "POST /api/communications/transcript",
      analyzeCommunication: "POST /api/communications/:id/analyze",
      alerts: "/api/alerts",
      riskDashboard: "GET /api/alerts/dashboard",
      criticalAlerts: "GET /api/alerts/critical",
    },
  });
});

app.get("/health", async (req, res) => {
  try {
    const mongoose = require("mongoose");
    if (mongoose.connection.readyState !== 1) {
      return res
        .status(503)
        .json({ status: "error", mongodb: "not connected" });
    }
    res.json({ status: "ok", mongodb: "connected" });
  } catch (err) {
    res.status(503).json({ status: "error", mongodb: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
