import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import BookingLog from "../models/BookingLog.js";
import Concert from "../models/Concert.js";
import TicketType from "../models/TicketType.js";
import Voucher from "../models/Voucher.js";
import VoucherUsage from "../models/VoucherUsage.js";

const RESERVATION_MINUTES = 15; // giữ chỗ 15 phút

//đặt vé (chống overselling)
export const createBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { concertId, ticketTypeId, quantity, voucherCode, idempotencyKey } =
      req.body;
    const userId = req.user._id;

    //validate
    if (!concertId || !ticketTypeId || !quantity || !idempotencyKey) {
      await session.abortTransaction(); //rollback lại tất cả thay đổi trong session
      session.endSession();
      return res.status(400).json({
        message:
          "concertId, ticketTypeId, quantity, idempotencyKey là bắt buộc",
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "quantity phải là số nguyên >= 1" });
    }

    //idempotency check — tránh double booking khi user retry
    const existingBooking = await Booking.findOne({ idempotencyKey }).session(
      session,
    );
    if (existingBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(200).json({
        message: "Booking đã tồn tại",
        booking: existingBooking,
      });
    }

    //ktra concert
    const concert = await Concert.findById(concertId).session(session);
    if (!concert) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Concert không tồn tại" });
    }
    if (concert.status !== "ACTIVE") {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Concert không trong trạng thái mở bán" });
    }
    const now = new Date();
    if (now < concert.saleStartDate || now > concert.saleEndDate) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Ngoài thời gian mở bán vé" });
    }

    //ktra ticket type
    const ticketType = await TicketType.findOne({
      _id: ticketTypeId,
      concertId,
    }).session(session);

    if (!ticketType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Loại vé không tồn tại" });
    }
    if (quantity > ticketType.maxPerBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Mỗi lần đặt tối đa ${ticketType.maxPerBooking} vé`,
      });
    }

    //giảm availableQuantity — chống overselling
    //chỉ thành công khi availableQuantity >= quantity
    const updatedTicketType = await TicketType.findOneAndUpdate(
      {
        _id: ticketTypeId,
        availableQuantity: { $gte: quantity }, //số vé còn phải lớn hơn số vé muốn mua
      },
      //$inc = tăng/giảm giá trị field
      { $inc: { availableQuantity: -quantity } },
      { new: true, session },
    );

    if (!updatedTicketType) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(409)
        .json({ message: "Vé không đủ. Vui lòng chọn loại vé khác." });
    }

    //tính tổng tiền vé
    const unitPrice = ticketType.price;
    const subtotal = unitPrice * quantity;
    let discountAmount = 0;
    let voucherId = null;
    let voucherDoc = null;

    //áp dụng voucher (nếu có)
    if (voucherCode) {
      voucherDoc = await Voucher.findOne({
        code: voucherCode.toUpperCase().trim(),
        isActive: true,
      }).session(session);

      if (!voucherDoc) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Voucher không hợp lệ hoặc không tồn tại" });
      }

      if (now < voucherDoc.validFrom || now > voucherDoc.validUntil) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Voucher đã hết hạn hoặc chưa có hiệu lực" });
      }

      if (subtotal < voucherDoc.minOrderAmount) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          message: `Đơn hàng tối thiểu ${voucherDoc.minOrderAmount.toLocaleString()}đ để dùng voucher này`,
        });
      }

      //tăng currentUsage, chỉ thành công nếu chưa đạt maxUsage
      const updatedVoucher = await Voucher.findOneAndUpdate(
        {
          _id: voucherDoc._id,
          currentUsage: { $lt: voucherDoc.maxUsage },
        },
        { $inc: { currentUsage: 1 } }, //tăng 1
        { new: true, session },
      );
      if (!updatedVoucher) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
      }

      //tính discount
      voucherId = voucherDoc._id;
      if (voucherDoc.discountType === "PERCENT") {
        discountAmount = Math.round(
          (subtotal * voucherDoc.discountValue) / 100,
        );
      } else {
        //đảm bảo discount không bao giờ > tiền phải trả
        discountAmount = Math.min(voucherDoc.discountValue, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    //tạo Booking
    const expiredAt = new Date(now.getTime() + RESERVATION_MINUTES * 60 * 1000);
    const [booking] = await Booking.create(
      [
        {
          userId,
          concertId,
          ticketTypeId,
          voucherId,
          quantity,
          unitPrice,
          discountAmount,
          totalAmount,
          status: "RESERVED",
          idempotencyKey,
          reservedAt: now,
          expiredAt,
        },
      ],
      { session },
    );

    //tạo VoucherUsage (nếu có voucher)
    if (voucherId) {
      try {
        await VoucherUsage.create(
          [{ voucherId, userId, bookingId: booking._id, usedAt: now }],
          { session },
        );
      } catch (dupErr) {
        //user đã dùng voucher này
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Bạn đã sử dụng voucher này rồi" });
      }
    }

    //tạo BookingLog
    await BookingLog.create(
      [
        {
          bookingId: booking._id,
          previousStatus: "RECEIVED",
          newStatus: "RESERVED",
          changedBy: userId,
          reason: "Booking tạo thành công, vé được giữ chỗ",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Đặt vé thành công. Vui lòng thanh toán trong 15 phút.",
      booking: {
        _id: booking._id,
        status: booking.status,
        quantity,
        unitPrice,
        discountAmount,
        totalAmount,
        expiredAt,
        concert: {
          _id: concert._id,
          name: concert.name,
          venue: concert.venue,
          eventDate: concert.eventDate,
        },
        ticketType: { _id: ticketType._id, name: ticketType.name },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("createBooking error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    //phân trang và filter
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("concertId", "name venue eventDate bannerUrl")
        .populate("ticketTypeId", "name price")
        .populate("voucherId", "code discountType discountValue")
        .select("-__v -idempotencyKey"),
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

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("concertId", "name venue eventDate bannerUrl")
      .populate("ticketTypeId", "name price")
      .populate("voucherId", "code discountType discountValue")
      .select("-__v -idempotencyKey");

    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }

    return res.status(200).json({ booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking không tồn tại" });
    }

    if (booking.status !== "RESERVED") {
      return res.status(400).json({
        message: `Không thể xác nhận thanh toán. Trạng thái hiện tại: ${booking.status}`,
      });
    }

    if (new Date() > booking.expiredAt) {
      //hết giờ thì đánh dấu expired
      booking.status = "EXPIRED";
      await booking.save();
      return res
        .status(400)
        .json({ message: "Thời gian giữ chỗ đã hết. Vui lòng đặt lại." });
    }

    const previousStatus = booking.status;
    booking.status = "CONFIRMED";
    booking.completedAt = new Date();
    await booking.save();

    await BookingLog.create({
      bookingId: booking._id,
      previousStatus,
      newStatus: "CONFIRMED",
      changedBy: req.user._id,
      reason: "Khách hàng xác nhận thanh toán",
    });

    return res
      .status(200)
      .json({ message: "Thanh toán xác nhận thành công", booking });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const cancelBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Booking không tồn tại" });
    }
    if (!["RESERVED", "WAITING_PAYMENT"].includes(booking.status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Không thể hủy booking ở trạng thái ${booking.status}`,
      });
    }

    const previousStatus = booking.status;
    booking.status = "CANCELLED";
    await booking.save({ session });

    //hoàn lại vé
    await TicketType.findByIdAndUpdate(
      booking.ticketTypeId,
      { $inc: { availableQuantity: booking.quantity } }, //tăng lên lại quantity vé bị hoàn
      { session },
    );

    //hoàn lại voucher nếu có
    if (booking.voucherId) {
      await Voucher.findByIdAndUpdate(
        booking.voucherId,
        { $inc: { currentUsage: -1 } }, //giảm đi lượt đã sử dụng
        { session },
      );
      await VoucherUsage.deleteOne({ bookingId: booking._id }, { session });
    }

    await BookingLog.create(
      [
        {
          bookingId: booking._id,
          previousStatus,
          newStatus: "CANCELLED",
          changedBy: req.user._id,
          reason: req.body.reason || "Khách hàng hủy đơn",
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({ message: "Hủy booking thành công", booking });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
