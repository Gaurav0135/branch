import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  amount: Number,
  method: { type: String, enum: ["upi", "cod"], default: "upi" },
  upiRefId: String,
  phoneNumber: String,
  status: String
});

export default mongoose.model("Payment", paymentSchema);