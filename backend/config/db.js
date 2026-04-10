import mongoose from "mongoose";

const MAX_RETRIES = Number(process.env.DB_CONNECT_MAX_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000);
const SERVER_SELECTION_TIMEOUT_MS = Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS || 10000);
const SOCKET_TIMEOUT_MS = Number(process.env.DB_SOCKET_TIMEOUT_MS || 45000);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let listenersAttached = false;

const attachConnectionListeners = () => {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
};

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  attachConnectionListeners();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
        socketTimeoutMS: SOCKET_TIMEOUT_MS,
      });
      console.log("MongoDB Connected");
      return;
    } catch (err) {
      console.error("MongoDB connection failed:", err.message);

      if (attempt === MAX_RETRIES) {
        throw new Error(`Exceeded MongoDB retry limit after ${MAX_RETRIES} attempts`);
      }

      console.log(`Retrying MongoDB connection (${attempt}/${MAX_RETRIES - 1}) in ${RETRY_DELAY_MS}ms...`);
      await sleep(RETRY_DELAY_MS);
    }
  }
};

export default connectDB;