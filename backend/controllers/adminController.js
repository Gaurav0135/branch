import Service from "../models/Service.js";
import Image from "../models/Image.js";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import { sendBookingAcceptedEmail, sendBookingRejectedEmail } from "../services/emailService.js";
import { runSmtpDiagnostic } from "../services/emailService.js";
import fs from "fs/promises";
import path from "path";

const triggerBookingEmail = async (booking, emailType) => {
  const currentEmailMeta = booking.ticketEmail?.toObject
    ? booking.ticketEmail.toObject()
    : (booking.ticketEmail || {});

  booking.ticketEmail = {
    ...currentEmailMeta,
    type: emailType,
    status: "not_sent",
    sentAt: null,
    lastAttemptAt: new Date(),
    error: ""
  };

  await booking.save();

  try {
    if (emailType === "accepted") {
      await sendBookingAcceptedEmail(booking);
    } else {
      await sendBookingRejectedEmail(booking);
    }

    booking.ticketEmail.status = "sent";
    booking.ticketEmail.sentAt = new Date();
    booking.ticketEmail.error = "";
  } catch (emailErr) {
    booking.ticketEmail.status = "failed";
    booking.ticketEmail.error = emailErr.message;
    console.error("Booking status email failed:", emailErr.message);
  }

  await booking.save();
};

const markBookingEmailPending = async (booking, emailType) => {
  const currentEmailMeta = booking.ticketEmail?.toObject
    ? booking.ticketEmail.toObject()
    : (booking.ticketEmail || {});

  booking.ticketEmail = {
    ...currentEmailMeta,
    type: emailType,
    status: "not_sent",
    sentAt: null,
    lastAttemptAt: new Date(),
    error: ""
  };

  await booking.save();
};

const triggerBookingEmailInBackground = async (bookingId, emailType) => {
  try {
    const booking = await Booking.findById(bookingId)
      .populate("userId", "name email role")
      .populate("serviceId", "title price category");

    if (!booking) {
      return;
    }

    await triggerBookingEmail(booking, emailType);
  } catch (err) {
    console.error("Background booking email task failed:", err.message);
  }
};

// Service management
export const createService = async (req, res) => {
  try {
    const service = await Service.create(req.body);
    res.json(service);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!service) return res.status(404).json({ msg: "Service not found" });
    res.json(service);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return res.status(404).json({ msg: "Service not found" });
    res.json({ msg: "Service deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Image management
export const createImage = async (req, res) => {
  try {
    const image = await Image.create(req.body);
    res.json(image);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findByIdAndUpdate(id, req.body, { new: true });
    if (!image) return res.status(404).json({ msg: "Image not found" });
    res.json(image);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    const image = await Image.findByIdAndDelete(id);
    if (!image) return res.status(404).json({ msg: "Image not found" });

    // Optionally delete the file from filesystem
    const filePath = path.join(process.cwd(), "uploads", image.imageUrl);
    try {
      await fs.unlink(filePath);
    } catch (fileErr) {
      console.log("File not found or could not delete:", fileErr.message);
    }

    res.json({ msg: "Image deleted" });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// User management
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ msg: "User deleted successfully", id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Booking management
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("userId", "name email role")
      .populate("serviceId", "title price category")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus, paymentStatus } = req.body;

    const booking = await Booking.findById(id)
      .populate("userId", "name email role")
      .populate("serviceId", "title price category");

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    const previousStatus = booking.bookingStatus;
    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    const acceptedNow = bookingStatus === "confirmed" && previousStatus !== "confirmed";
    const rejectedNow = bookingStatus === "rejected" && previousStatus !== "rejected";

    await booking.save();

    if (acceptedNow || rejectedNow) {
      await markBookingEmailPending(booking, acceptedNow ? "accepted" : "rejected");
      void triggerBookingEmailInBackground(booking._id, acceptedNow ? "accepted" : "rejected");
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const resendBookingEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("userId", "name email role")
      .populate("serviceId", "title price category");

    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    if (!["confirmed", "rejected"].includes(booking.bookingStatus)) {
      return res.status(400).json({ msg: "Email can only be resent for confirmed or rejected bookings." });
    }

    const emailType = booking.bookingStatus === "confirmed" ? "accepted" : "rejected";
    await markBookingEmailPending(booking, emailType);
    void triggerBookingEmailInBackground(booking._id, emailType);

    return res.json(booking);
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) return res.status(404).json({ msg: "Booking not found" });

    res.json({ msg: "Booking deleted successfully", id });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalServices, totalBookings, pendingBookings, confirmedBookings, completedBookings, cancelledBookings] = await Promise.all([
      User.countDocuments(),
      Service.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ bookingStatus: "pending" }),
      Booking.countDocuments({ bookingStatus: "confirmed" }),
      Booking.countDocuments({ bookingStatus: "completed" }),
      Booking.countDocuments({ bookingStatus: "cancelled" }),
    ]);

    res.json({
      totalUsers,
      totalServices,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      completedBookings,
      cancelledBookings,
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

export const smtpDiagnostic = async (_req, res) => {
  try {
    const result = await runSmtpDiagnostic();
    const statusCode = result.ok ? 200 : 503;
    res.status(statusCode).json(result);
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};