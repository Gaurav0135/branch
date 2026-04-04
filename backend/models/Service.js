import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  title: String,
  price: Number,
  description: String
});

export default mongoose.model("Service", serviceSchema);