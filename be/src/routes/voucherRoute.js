import express from "express";
import {
  validateVoucher,
  createVoucher,
  listVouchers,
  updateVoucher,
  toggleVoucherStatus,
} from "../controller/voucherController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

router.get("/validate", protectedRoute, validateVoucher);

//admin
router.post("/", protectedRoute, adminOnly, createVoucher);
router.get("/", protectedRoute, adminOnly, listVouchers);
router.put("/:id", protectedRoute, adminOnly, updateVoucher);
router.patch(
  "/:id/toggle-status",
  protectedRoute,
  adminOnly,
  toggleVoucherStatus,
);

export default router;
