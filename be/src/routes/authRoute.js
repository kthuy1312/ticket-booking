import express from "express";
import { register, login, getMe } from "../controller/authController.js";
import { protectedRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectedRoute, getMe);

export default router;
