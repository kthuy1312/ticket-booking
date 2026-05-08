import mongoose from "mongoose";

//dùng để theo dõi lịch sử dùng voucher
const voucherUsageSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    usedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

voucherUsageSchema.index({ voucherId: 1 });
voucherUsageSchema.index({ userId: 1 });
voucherUsageSchema.index({ bookingId: 1 });

//tránh user dùng 1 voucher nhiều lần
voucherUsageSchema.index({ voucherId: 1, userId: 1 }, { unique: true });

const VoucherUsage = mongoose.model("VoucherUsage", voucherUsageSchema);
export default VoucherUsage;
