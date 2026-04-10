import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String
});

serviceSchema.index({ title: 1 });

export default mongoose.model("Service", serviceSchema);