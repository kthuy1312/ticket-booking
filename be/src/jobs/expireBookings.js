//chạy mỗi 60 giây để tìm các booking RESERVED
//nếu quá expiredAt thì chuyển sang EXPIRED,
//hoàn lại vé

import Booking from "../models/Booking.js";
import BookingLog from "../models/BookingLog.js";
import TicketType from "../models/TicketType.js";
import Voucher from "../models/Voucher.js";
import VoucherUsage from "../models/VoucherUsage.js";
import mongoose from "mongoose";

const INTERVAL_MS = 60 * 1000; // 60 giây

export const startExpireBookingsJob = () => {
  console.log("⏰ Expire bookings job started (interval: 60s)");
  setInterval(runExpireJob, INTERVAL_MS);
};

const runExpireJob = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    //tìm tất cả booking RESERVED đã quá hạn
    const expiredBookings = await Booking.find({
      status: "RESERVED",
      expiredAt: { $lt: now },
    }).session(session);

    if (expiredBookings.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return;
    }

    console.log(`⏰ Expiring ${expiredBookings.length} bookings...`);

    for (const booking of expiredBookings) {
      //đổi trạng thái
      booking.status = "EXPIRED";
      await booking.save({ session });

      //hoàn lại vé
      await TicketType.findByIdAndUpdate(
        booking.ticketTypeId,
        { $inc: { availableQuantity: booking.quantity } },
        { session },
      );

      //hoàn lại voucher nếu có
      if (booking.voucherId) {
        await Voucher.findByIdAndUpdate(
          booking.voucherId,
          { $inc: { currentUsage: -1 } },
          { session },
        );
        await VoucherUsage.deleteOne({ bookingId: booking._id }, { session });
      }

      //chi log
      const systemUserId = booking.userId; //log dưới tên user
      await BookingLog.create(
        [
          {
            bookingId: booking._id,
            previousStatus: "RESERVED",
            newStatus: "EXPIRED",
            changedBy: systemUserId,
            reason: "Hết thời gian giữ chỗ (tự động)",
          },
        ],
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();
    console.log(`Expired ${expiredBookings.length} bookings successfully`);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("❌ Expire job error:", err);
  }
};
