import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  title: String,
  category: String,
  imageUrl: String,
  cloudinaryPublicId: String,
  sourcePath: String
}, { timestamps: true });

imageSchema.index({ category: 1, createdAt: -1 });
imageSchema.index({ createdAt: -1 });

export default mongoose.model("Image", imageSchema);