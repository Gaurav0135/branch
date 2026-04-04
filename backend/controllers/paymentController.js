import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";

export const makePayment = async (req, res) => {
  try {
    const { bookingId, amount, method = "upi", upiRefId = "", phoneNumber = "" } = req.body;

    if (method === "upi" && !upiRefId.trim()) {
      return res.status(400).json({ msg: "UPI reference ID is required." });
    }

    if (method === "cod" && !phoneNumber.trim()) {
      return res.status(400).json({ msg: "Phone number is required for Cash on Delivery." });
    }

    if (method === "cod" && !/^[0-9]{10}$/.test(phoneNumber.trim())) {
      return res.status(400).json({ msg: "Phone number must be a valid 10-digit number." });
    }

    const payment = await Payment.create({
      bookingId,
      amount,
      method,
      upiRefId: upiRefId.trim(),
      phoneNumber: phoneNumber.trim(),
      status: method === "upi" ? "submitted" : "success"
    });

    const updateData = {
      paymentStatus: method === "upi" ? "submitted" : "paid",
      paymentMethod: method,
      upiRefId: upiRefId.trim()
    };

    if (method === "cod") {
      updateData.phoneNumber = phoneNumber.trim();
    }

    await Booking.findByIdAndUpdate(bookingId, updateData);

    res.json({ msg: "Payment Successful", payment });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
