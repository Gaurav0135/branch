import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
  try {
    const durationHours = Number(req.body.durationHours || 1);
    if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) {
      return res.status(400).json({ msg: "Duration must be between 1 and 12 hours" });
    }

    const booking = await Booking.create({
      ...req.body,
      durationHours,
      userId: req.user.id
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("serviceId", "title price description category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("serviceId", "title price description category")
      .sort({ createdAt: -1 })
      .lean();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};