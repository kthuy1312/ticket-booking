import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "../.env"),
});

import User from "./models/User.js";
import Concert from "./models/Concert.js";
import TicketType from "./models/TicketType.js";
import Voucher from "./models/Voucher.js";

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  //xoá index cũ không còn dùng (từ project khác) để tránh conflict
  try {
    await User.collection.dropIndex("username_1");
    console.log("🧹 Dropped stale index: username_1");
  } catch (_) {
    /* index không tồn tại thì bỏ qua */
  }

  //xoá dlieu cũ
  await Promise.all([
    User.deleteMany({}),
    Concert.deleteMany({}),
    TicketType.deleteMany({}),
    Voucher.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  //Users
  const adminHash = await bcrypt.hash("123456", 10);
  const userHash = await bcrypt.hash("123456", 10);

  const [admin, user1, user2] = await User.insertMany([
    {
      email: "ad@gmail.com",
      passwordHash: adminHash,
      fullName: "Super Admin",
      phone: "0900000001",
      role: "ADMIN",
    },
    {
      email: "1@gmail.com",
      passwordHash: userHash,
      fullName: "Nguyễn Văn A",
      phone: "0900000002",
      role: "USER",
    },
    {
      email: "2@gmail.com",
      passwordHash: userHash,
      fullName: "Trần Thị B",
      phone: "0900000003",
      role: "USER",
    },
  ]);
  console.log("Created users:", admin.email, user1.email, user2.email);

  //Concerts
  const now = new Date();
  const [concert1, concert2] = await Concert.insertMany([
    {
      name: "BTS World Tour 2026 – Ho Chi Minh City",
      description: "Sự kiện âm nhạc lớn nhất năm 2026 tại TP.HCM",
      venue: "SVĐ Quân Khu 7, TP.HCM",
      eventDate: new Date("2026-08-15T19:00:00+07:00"),
      saleStartDate: new Date(now.getTime() - 1000 * 60 * 60), // 1 tiếng trước
      saleEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30), // 30 ngày sau
      status: "ACTIVE",
      createdBy: admin._id,
    },
    {
      name: "Sơn Tùng M-TP – Một Ngàn Nốt Trầm Live Concert",
      description: "Concert âm nhạc đặc biệt của Sơn Tùng M-TP",
      venue: "Nhà hát Hòa Bình, TP.HCM",
      eventDate: new Date("2026-09-20T20:00:00+07:00"),
      saleStartDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7), // 7 ngày nữa
      saleEndDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 60),
      status: "DRAFT",
      createdBy: admin._id,
    },
  ]);
  console.log("Created concerts:", concert1.name, concert2.name);

  //Ticket Types
  const ticketTypes = await TicketType.insertMany([
    {
      concertId: concert1._id,
      name: "VIP",
      description: "Khu vực VIP sát sân khấu, kèm quà tặng đặc biệt",
      price: 3_500_000,
      totalQuantity: 500,
      availableQuantity: 500,
      maxPerBooking: 4,
    },
    {
      concertId: concert1._id,
      name: "Standard",
      description: "Khu vực tiêu chuẩn, tầm nhìn tốt",
      price: 1_500_000,
      totalQuantity: 2000,
      availableQuantity: 2000,
      maxPerBooking: 6,
    },
    {
      concertId: concert1._id,
      name: "Early Bird",
      description: "Vé ưu đãi sớm, số lượng giới hạn",
      price: 800_000,
      totalQuantity: 200,
      availableQuantity: 200,
      maxPerBooking: 2,
    },
    {
      concertId: concert2._id,
      name: "VIP",
      description: "Khu vực VIP",
      price: 2_000_000,
      totalQuantity: 200,
      availableQuantity: 200,
      maxPerBooking: 4,
    },
    {
      concertId: concert2._id,
      name: "Standard",
      description: "Khu vực tiêu chuẩn",
      price: 800_000,
      totalQuantity: 1000,
      availableQuantity: 1000,
      maxPerBooking: 5,
    },
  ]);
  console.log("Created", ticketTypes.length, "ticket types");

  //Vouchers
  const vouchers = await Voucher.insertMany([
    {
      code: "FLASHSALE50",
      description: "Flash Sale giảm 50% cho đơn từ 1 triệu",
      discountType: "PERCENT",
      discountValue: 50,
      maxUsage: 100,
      currentUsage: 0,
      minOrderAmount: 1_000_000,
      validFrom: new Date(now.getTime() - 1000 * 60 * 60),
      validUntil: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3),
      isActive: true,
      createdBy: admin._id,
    },
    {
      code: "WELCOME200K",
      description: "Giảm 200.000đ cho đơn từ 500.000đ",
      discountType: "FIXED",
      discountValue: 200_000,
      maxUsage: 500,
      currentUsage: 0,
      minOrderAmount: 500_000,
      validFrom: new Date(now.getTime() - 1000 * 60 * 60),
      validUntil: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30),
      isActive: true,
      createdBy: admin._id,
    },
    {
      code: "VIP30",
      description: "Giảm 30% dành riêng cho vé VIP",
      discountType: "PERCENT",
      discountValue: 30,
      maxUsage: 50,
      currentUsage: 0,
      minOrderAmount: 3_000_000,
      validFrom: new Date(now.getTime() - 1000 * 60 * 60),
      validUntil: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      isActive: true,
      createdBy: admin._id,
    },
  ]);
  console.log("Created", vouchers.length, "vouchers");

  console.log("\n✨ Seed completed!");
  console.log("─────────────────────────────────────────");
  console.log("Admin:   admin@concert.vn / Admin@123");
  console.log("User 1:  user1@example.com / User@123");
  console.log("User 2:  user2@example.com / User@123");
  console.log("─────────────────────────────────────────");
  console.log("Concert 1 (ACTIVE):", concert1._id.toString());
  console.log("Concert 2 (DRAFT): ", concert2._id.toString());
  console.log("─────────────────────────────────────────");
  ticketTypes.forEach((t) =>
    console.log(`${t.name} [${t.concertId}]:`, t._id.toString()),
  );
  console.log("─────────────────────────────────────────");
  vouchers.forEach((v) => console.log(`${v.code}:`, v._id.toString()));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
