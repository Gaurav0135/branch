import mongoose from "mongoose";

const MAX_RETRIES = Number(process.env.DB_CONNECT_MAX_RETRIES || 5);
const RETRY_DELAY_MS = Number(process.env.DB_CONNECT_RETRY_DELAY_MS || 5000);

const connectDB = async (attempt = 1) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);

    if (attempt < MAX_RETRIES) {
      console.log(`Retrying MongoDB connection (${attempt}/${MAX_RETRIES - 1}) in ${RETRY_DELAY_MS}ms...`);
      setTimeout(() => {
        void connectDB(attempt + 1);
      }, RETRY_DELAY_MS);
      return;
    }

    console.error("Exceeded MongoDB retry limit. Exiting process.");
    process.exit(1);
  }
};

export default connectDB;