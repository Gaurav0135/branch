import fs from "fs/promises";
import path from "path";
import Image from "../models/Image.js";
import { cloudinary, ensureCloudinaryConfigured } from "../config/cloudinary.js";

const imageRoot = path.join(process.cwd(), "uploads", "photo");

const walkImages = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const subfiles = await walkImages(fullPath);
      files.push(...subfiles);
    } else if (entry.isFile()) {
      const rel = path.relative(imageRoot, fullPath).replace(/\\/g, "/");
      files.push(rel);
    }
  }

  return files;
};

const toTitle = (filePath) => path
  .basename(filePath, path.extname(filePath))
  .replace(/[-_]/g, " ")
  .trim();

const isCloudinaryUrl = (url = "") => /^https?:\/\/res\.cloudinary\.com\//i.test(url);

const safePublicId = (value) => value
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9-_]/g, "")
  .replace(/-+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 80);

const uploadLocalFileToCloudinary = async ({ absolutePath, category, filePath }) => {
  const fileBaseName = path.basename(filePath, path.extname(filePath));
  const publicId = safePublicId(fileBaseName) || `img-${Date.now()}`;

  return cloudinary.uploader.upload(absolutePath, {
    folder: `frameza/gallery/${category || "uncategorized"}`,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
};

export const uploadBufferToCloudinary = async ({ buffer, category, title, filename }) => {
  if (!ensureCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured in environment variables.");
  }

  const base = title || path.basename(filename || `image-${Date.now()}`, path.extname(filename || ""));
  const publicId = `${Date.now()}-${safePublicId(base) || "image"}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `frameza/gallery/${category || "uncategorized"}`,
        public_id: publicId,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

export const syncLocalImagesToCloudinary = async () => {
  const summary = { processed: 0, uploaded: 0, updated: 0, skipped: 0 };

  if (!ensureCloudinaryConfigured()) {
    return summary;
  }

  let imageFiles = [];
  try {
    imageFiles = await walkImages(imageRoot);
  } catch (err) {
    if (err.code === "ENOENT") {
      return summary;
    }
    throw err;
  }

  for (const relativePath of imageFiles) {
    const sourcePath = `photo/${relativePath}`;
    const absolutePath = path.join(imageRoot, relativePath);
    const category = relativePath.split("/")[0] || "uncategorized";

    summary.processed += 1;

    const existing = await Image.findOne({
      $or: [{ sourcePath }, { imageUrl: sourcePath }],
    });

    if (existing && isCloudinaryUrl(existing.imageUrl)) {
      summary.skipped += 1;
      continue;
    }

    const uploadResult = await uploadLocalFileToCloudinary({
      absolutePath,
      category,
      filePath: relativePath,
    });

    const payload = {
      title: existing?.title || toTitle(relativePath),
      category,
      imageUrl: uploadResult.secure_url,
      cloudinaryPublicId: uploadResult.public_id,
      sourcePath,
    };

    if (existing) {
      await Image.updateOne({ _id: existing._id }, { $set: payload });
      summary.updated += 1;
    } else {
      await Image.create(payload);
      summary.uploaded += 1;
    }
  }

  return summary;
};
