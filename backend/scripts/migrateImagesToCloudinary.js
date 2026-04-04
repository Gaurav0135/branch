import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import { ensureCloudinaryConfigured } from "../config/cloudinary.js";
import { syncLocalImagesToCloudinary } from "../services/imageSyncService.js";

dotenv.config();

const run = async () => {
  try {
    if (!ensureCloudinaryConfigured()) {
      throw new Error(
        "Cloudinary credentials missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env"
      );
    }

    await connectDB();

    const summary = await syncLocalImagesToCloudinary();

    console.log("Cloudinary migration complete:");
    console.log(`Processed: ${summary.processed}`);
    console.log(`Uploaded: ${summary.uploaded}`);
    console.log(`Updated: ${summary.updated}`);
    console.log(`Skipped: ${summary.skipped}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Cloudinary migration failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

run();
