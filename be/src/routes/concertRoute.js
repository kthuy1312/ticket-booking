import express from "express";
import {
  listConcerts,
  getConcert,
  getTicketTypes,
  createConcert,
  updateConcert,
  updateConcertStatus,
} from "../controller/concertController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", listConcerts);
router.get("/:id", getConcert);
router.get("/:id/ticket-types", getTicketTypes);

//admin
router.post(
  "/",
  protectedRoute,
  adminOnly,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "seatMap", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  createConcert,
);

router.put(
  "/:id",
  protectedRoute,
  adminOnly,
  upload.fields([
    { name: "banner", maxCount: 1 },
    { name: "seatMap", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]),
  updateConcert,
);

router.patch("/:id/status", protectedRoute, adminOnly, updateConcertStatus);

export default router;
