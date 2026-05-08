import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import BookingLog from "../models/BookingLog.js";
import Concert from "../models/Concert.js";
import TicketType from "../models/TicketType.js";
import Voucher from "../models/Voucher.js";
import VoucherUsage from "../models/VoucherUsage.js";

//bookings
export const getAllBookings = async (req, res) => {
  try {
    const { status, concertId, userId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (concertId) filter.concertId = concertId;
    if (userId) filter.userId = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("userId", "fullName email phone")
        .populate("concertId", "name venue eventDate")
        .populate("ticketTypeId", "name price")
        .populate("voucherId", "code discountType discountValue")
        .select("-__v"),
      Booking.countDocuments(filter),
    ]);

    return res.status(200).json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getBookingDetail = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("userId", "fullName email phone role")
      .populate("concertId", "name venue eventDate status")
      .populate("ticketTypeId", "name price totalQuantity availableQuantity")
      .populate("voucherId", "code discountType discountValue")
      .select("-__v");

    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }

    const logs = await BookingLog.find({ bookingId: booking._id })
      .sort({ createdAt: 1 })
      .populate("changedBy", "fullName email role")
      .select("-__v");

    return res.status(200).json({ booking, logs });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const ALLOWED_TRANSITIONS = {
  RECEIVED: ["RESERVED", "CANCELLED"],
  RESERVED: ["WAITING_PAYMENT", "CONFIRMED", "CANCELLED", "EXPIRED"],
  WAITING_PAYMENT: ["CONFIRMED", "CANCELLED", "EXPIRED"],
  CONFIRMED: ["CANCELLED"],
  CANCELLED: [],
  EXPIRED: [],
};

export const updateBookingStatus = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { status, reason } = req.body;
    if (!status) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "status là bắt buộc" });
    }

    const booking = await Booking.findById(req.params.id).session(session);
    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Booking không tồn tại" });
    }

    const allowed = ALLOWED_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Không thể chuyển từ ${booking.status} sang ${status}`,
        allowedTransitions: allowed,
      });
    }

    const previousStatus = booking.status;

    //nếu chuyển sang CANCELLED hoặc EXPIRED thì hoàn lại vé
    if (
      (status === "CANCELLED" || status === "EXPIRED") &&
      ["RESERVED", "WAITING_PAYMENT"].includes(previousStatus)
    ) {
      await TicketType.findByIdAndUpdate(
        booking.ticketTypeId,
        { $inc: { availableQuantity: booking.quantity } },
        { session },
      );
      if (booking.voucherId) {
        await Voucher.findByIdAndUpdate(
          booking.voucherId,
          { $inc: { currentUsage: -1 } },
          { session },
        );
        await VoucherUsage.deleteOne({ bookingId: booking._id }, { session });
      }
    }

    //nếu chuyển sang CONFIRMED thì set completedAt
    if (status === "CONFIRMED") {
      booking.completedAt = new Date();
    }

    booking.status = status;
    await booking.save({ session });

    await BookingLog.create(
      [
        {
          bookingId: booking._id,
          previousStatus,
          newStatus: status,
          changedBy: req.user._id,
          reason: reason || `Admin cập nhật thủ công`,
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái thành công", booking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//concerts
export const getAllConcerts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const concerts = await Concert.find(filter)
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email")
      .select("-__v");
    return res.status(200).json({ concerts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const createTicketType = async (req, res) => {
  try {
    const { name, description, price, totalQuantity, maxPerBooking } = req.body;
    const concertId = req.params.id;

    if (!name || price == null || !totalQuantity) {
      return res
        .status(400)
        .json({ message: "name, price, totalQuantity là bắt buộc" });
    }

    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: "Concert không tồn tại" });
    }

    const ticketType = await TicketType.create({
      concertId,
      name: name.trim(),
      description: description?.trim(),
      price,
      totalQuantity,
      availableQuantity: totalQuantity,
      maxPerBooking: maxPerBooking || 5,
    });

    return res
      .status(201)
      .json({ message: "Tạo loại vé thành công", ticketType });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ message: "Tên loại vé đã tồn tại trong concert này" });
    }
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getTicketAvailability = async (req, res) => {
  try {
    const ticketType = await TicketType.findById(req.params.id)
      .populate("concertId", "name status")
      .select("-__v");
    if (!ticketType) {
      return res.status(404).json({ message: "Loại vé không tồn tại" });
    }
    return res.status(200).json({
      ticketType: {
        _id: ticketType._id,
        name: ticketType.name,
        price: ticketType.price,
        totalQuantity: ticketType.totalQuantity,
        availableQuantity: ticketType.availableQuantity,
        soldQuantity: ticketType.totalQuantity - ticketType.availableQuantity,
        concert: ticketType.concertId,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//danh sách voucher + thống kê usage
export const getVoucherStats = async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "fullName email")
      .select("-__v");

    //thêm usage rate (phần trăm voucher đã được sử dụng)
    const enriched = vouchers.map((v) => ({
      ...v.toObject(),
      usageRate:
        v.maxUsage > 0 ? Math.round((v.currentUsage / v.maxUsage) * 100) : 0,
      remainingUsage: v.maxUsage - v.currentUsage,
    }));

    return res.status(200).json({ vouchers: enriched });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalBookings,
      bookingsByStatus,
      totalConcerts,
      totalVouchers,
      recentBookings,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Concert.countDocuments(),
      Voucher.countDocuments(),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "fullName email")
        .populate("concertId", "name")
        .populate("ticketTypeId", "name")
        .select("status totalAmount quantity createdAt"),
    ]);

    //doanh thu từ CONFIRMED bookings
    const revenueAgg = await Booking.aggregate([
      { $match: { status: "CONFIRMED" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);
    const revenue = revenueAgg[0] || { total: 0, count: 0 };

    const statusMap = {};
    bookingsByStatus.forEach((b) => {
      statusMap[b._id] = b.count;
    });

    return res.status(200).json({
      stats: {
        totalBookings,
        bookingsByStatus: statusMap,
        confirmedRevenue: revenue.total,
        confirmedBookings: revenue.count,
        totalConcerts,
        totalVouchers,
      },
      recentBookings,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
