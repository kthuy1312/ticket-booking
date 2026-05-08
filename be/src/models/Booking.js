import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    concertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concert",
      required: true,
    },

    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
    },

    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "RECEIVED",
        "RESERVED",
        "WAITING_PAYMENT",
        "CONFIRMED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "RECEIVED",
    },

    //mã định danh duy nhất
    //để đảm bảo 1 request chỉ được xly 1 lần, dù user có gửi lại nhiều lần
    idempotencyKey: {
      type: String,
      unique: true,
      required: true,
    },

    reservedAt: Date,
    expiredAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  },
);

bookingSchema.index({ userId: 1 });
bookingSchema.index({ concertId: 1 });
bookingSchema.index({ ticketTypeId: 1 });
bookingSchema.index({ status: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
