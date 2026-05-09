import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

import User from "../models/User.js";
import Concert from "../models/Concert.js";
import TicketType from "../models/TicketType.js";
import Voucher from "../models/Voucher.js";
import Booking from "../models/Booking.js";
import BookingLog from "../models/BookingLog.js";
import VoucherUsage from "../models/VoucherUsage.js";

//đổi định dạng MongoDB Extended JSON ($oid, $date) sang Mongoose Object
const transform = (obj) => {
  if (Array.isArray(obj)) return obj.map(transform);
  if (obj && typeof obj === "object") {
    if (obj.$oid) return new mongoose.Types.ObjectId(obj.$oid);
    if (obj.$date) {
      return new Date(typeof obj.$date === "string" ? obj.$date : obj.$date);
    }
    const newObj = {};
    for (const key in obj) {
      newObj[key] = transform(obj[key]);
    }
    return newObj;
  }
  return obj;
};

const seedCollection = async (Model, fileName) => {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ File ${fileName} not found, skipping...`);
    return;
  }
  const rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const data = transform(rawData);
  await Model.deleteMany({});
  if (data.length > 0) {
    await Model.insertMany(data);
  }
  console.log(`Seeded ${data.length} records into ${Model.modelName}`);
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    //xóa index cũ nếu cần (để tránh lỗi project cũ)
    try {
      await User.collection.dropIndex("username_1");
    } catch (_) {}

    // Danh sách các bảng và file tương ứng
    const config = [
      { model: User, file: "test.users.json" },
      { model: Concert, file: "test.concerts.json" },
      { model: TicketType, file: "test.tickettypes.json" },
      { model: Voucher, file: "test.vouchers.json" },
      { model: Booking, file: "test.bookings.json" },
      { model: BookingLog, file: "test.bookinglogs.json" },
      { model: VoucherUsage, file: "test.voucherusages.json" },
    ];

    console.log("🚀 Starting seed process...");
    for (const item of config) {
      await seedCollection(item.model, item.file);
    }

    console.log("\n✨ ALL SEEDS COMPLETED SUCCESSFULLY!");
    console.log("─────────────────────────────────────────");
    console.log("Dữ liệu đã được đồng bộ hoàn toàn với các file JSON.");
    console.log("─────────────────────────────────────────");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
