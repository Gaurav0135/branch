import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  title: String,
  category: String,
  imageUrl: String,
  cloudinaryPublicId: String,
  sourcePath: String
}, { timestamps: true });

export default mongoose.model("Image", imageSchema);