import express from "express";
import {
  validateVoucher,
  createVoucher,
  listVouchers,
  toggleVoucherStatus,
} from "../controller/voucherController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/validate", protectedRoute, validateVoucher);

//admin
router.post("/", protectedRoute, adminOnly, createVoucher);
router.get("/", protectedRoute, adminOnly, listVouchers);
router.patch(
  "/:id/toggle-status",
  protectedRoute,
  adminOnly,
  toggleVoucherStatus,
);

export default router;
