import express from "express";
import {
  createBooking,
  getMyBookings,
  getBookingById,
  confirmPayment,
  cancelBooking,
} from "../controller/bookingController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { bookingLimiter } from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/", protectedRoute, bookingLimiter, createBooking);
router.get("/my", protectedRoute, getMyBookings);
router.get("/:id", protectedRoute, getBookingById);
router.post("/:id/confirm-payment", protectedRoute, confirmPayment);
router.post("/:id/cancel", protectedRoute, cancelBooking);

export default router;
