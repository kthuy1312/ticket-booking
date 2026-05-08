import express from "express";
import {
  getAllBookings,
  getBookingDetail,
  updateBookingStatus,
  getAllConcerts,
  createTicketType,
  updateTicketType,
  getTicketAvailability,
  getVoucherStats,
  getDashboardStats,
} from "../controller/operationController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

//tất cả các route dưới bắt buộc đi qua 2 middleware
router.use(protectedRoute, adminOnly);

//bookings
router.get("/bookings", getAllBookings);
router.get("/bookings/:id", getBookingDetail);
router.patch("/bookings/:id/status", updateBookingStatus);

//concerts
router.get("/concerts", getAllConcerts);
router.post("/concerts/:id/ticket-types", createTicketType);

//ticket types
router.get("/ticket-types/:id/availability", getTicketAvailability);
router.put("/ticket-types/:id", updateTicketType);

//vouchers
router.get("/vouchers", getVoucherStats);

//dashboard
router.get("/stats", getDashboardStats);

export default router;
