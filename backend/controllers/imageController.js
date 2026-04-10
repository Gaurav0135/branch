import Image from "../models/Image.js";
import { cloudinary, ensureCloudinaryConfigured } from "../config/cloudinary.js";
import {
  syncLocalImagesToCloudinary,
  uploadBufferToCloudinary,
} from "../services/imageSyncService.js";

let hasTriggeredStartupSync = false;

const triggerStartupImageSync = () => {
  if (hasTriggeredStartupSync) return;
  hasTriggeredStartupSync = true;

  // Keep GET /images fast by running local-to-cloud sync once in background.
  void syncLocalImagesToCloudinary().catch((err) => {
    console.error("Background image sync failed:", err.message);
  });
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: "Image file is required." });
    }

    if (!ensureCloudinaryConfigured()) {
      return res.status(500).json({
        msg: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
      });
    }

    const { title, category } = req.body;
    const normalizedCategory = category || "uncategorized";

    const uploadResult = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      category: normalizedCategory,
      title,
      filename: req.file.originalname,
    });

    const image = await Image.create({
      title: title || "Untitled",
      category: normalizedCategory,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
    });

    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getImages = async (req, res) => {
  try {
    triggerStartupImageSync();

    const { category } = req.query;

    const images = category
      ? await Image.find({ category }).sort({ createdAt: -1 }).lean()
      : await Image.find().sort({ createdAt: -1 }).lean();

    res.json(images);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category } = req.body;

    if (!id) {
      return res.status(400).json({ msg: "Image ID is required." });
    }

    const image = await Image.findByIdAndUpdate(
      id,
      { title, category },
      { new: true, runValidators: true }
    );

    if (!image) {
      return res.status(404).json({ msg: "Image not found." });
    }

    res.json({ msg: "Image updated successfully", image });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ msg: "Image ID is required." });
    }

    const image = await Image.findByIdAndDelete(id);

    if (!image) {
      return res.status(404).json({ msg: "Image not found." });
    }

    if (image.cloudinaryPublicId && ensureCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(image.cloudinaryPublicId);
      } catch (cloudinaryErr) {
        console.error("Error deleting from Cloudinary:", cloudinaryErr);
      }
    }

    res.json({ msg: "Image deleted successfully" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};