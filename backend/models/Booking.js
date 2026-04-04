import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
    date: String,
    durationHours: { type: Number, min: 1, max: 12, default: 1 },
    location: String,
    notes: String,
    upiRefId: String,
    phoneNumber: String,
    paymentMethod: { type: String, enum: ["upi", "cod"], default: "upi" },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: { type: String, default: "pending" },
    ticketEmail: {
      type: {
        type: String,
        enum: ["accepted", "rejected"],
      },
      status: {
        type: String,
        enum: ["not_sent", "sent", "failed"],
        default: "not_sent",
      },
      sentAt: Date,
      lastAttemptAt: Date,
      error: String,
    }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);