import express from "express";
import { createBooking, getBookings, getUserBookings } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
 
const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", adminOnly, getBookings);
router.get("/me", protect, getUserBookings);

export default router;

