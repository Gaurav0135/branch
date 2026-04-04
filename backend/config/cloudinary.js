import { v2 as cloudinary } from "cloudinary";

let configApplied = false;

export const isCloudinaryConfigured = () => Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET
);

export const ensureCloudinaryConfigured = () => {
  if (!isCloudinaryConfigured()) {
    return false;
  }

  if (!configApplied) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    configApplied = true;
  }

  return true;
};

export { cloudinary };
