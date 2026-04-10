import express from "express";
import cors from "cors";
import compression from "compression";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (_req, res) => {
  const state = mongoose.connection.readyState;
  const dbState =
    state === 1 ? "connected" :
      state === 2 ? "connecting" :
        state === 3 ? "disconnecting" : "disconnected";

  const status = dbState === "connected" ? 200 : 503;
  res.status(status).json({ ok: dbState === "connected", db: dbState });
});

app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
};

void startServer();