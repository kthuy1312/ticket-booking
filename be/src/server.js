import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./libs/db.js";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import authRoute from "./routes/authRoute.js";
import concertRoute from "./routes/concertRoute.js";
import bookingRoute from "./routes/bookingRoute.js";
import voucherRoute from "./routes/voucherRoute.js";
import operationRoute from "./routes/operationRoute.js";

//background jobs
import { startExpireBookingsJob } from "./jobs/expireBookings.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

//Swagger
const swaggerPath = path.join(__dirname, "swagger.json");
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRoute);
app.use("/api/concerts", concertRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/vouchers", voucherRoute);
app.use("/api/operation", operationRoute);

app.get("/health", (_req, res) => res.json({ status: "ok", ts: new Date() }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Internal Server Error" });
});

connectDB().then(() => {
  startExpireBookingsJob();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API Docs:  http://localhost:${PORT}/api-docs`);
  });
});
