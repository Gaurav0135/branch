import express from "express";
import { adminOnly } from "../middleware/adminMiddleware.js";
import {
  createService,
  updateService,
  deleteService,
  getAllServices,
  createImage,
  updateImage,
  deleteImage,
  getAllImages,
  updateUserRole,
  getAllUsers,
  deleteUser,
  getAllBookings,
  updateBookingStatus,
  resendBookingEmail,
  deleteBooking,
  getAdminStats,
} from "../controllers/adminController.js";

const router = express.Router();

// Service routes
router.post("/services", adminOnly, createService);
router.put("/services/:id", adminOnly, updateService);
router.delete("/services/:id", adminOnly, deleteService);
router.get("/services", adminOnly, getAllServices);

// Image routes
router.post("/images", adminOnly, createImage);
router.put("/images/:id", adminOnly, updateImage);
router.delete("/images/:id", adminOnly, deleteImage);
router.get("/images", adminOnly, getAllImages);

// User routes
router.put("/users/:id/role", adminOnly, updateUserRole);
router.get("/users", adminOnly, getAllUsers);
router.delete("/users/:id", adminOnly, deleteUser);

// Booking routes
router.get("/bookings", adminOnly, getAllBookings);
router.put("/bookings/:id", adminOnly, updateBookingStatus);
router.post("/bookings/:id/resend-email", adminOnly, resendBookingEmail);
router.delete("/bookings/:id", adminOnly, deleteBooking);

// Dashboard summary
router.get("/stats", adminOnly, getAdminStats);

export default router;