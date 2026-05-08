import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
    },

    //kiểu giảm giá (theo % hay cố định tiền    )
    discountType: {
      type: String,
      enum: ["PERCENT", "FIXED"],
      required: true,
    },

    //giá trị giảm cụ thể
    //nếu là PERCENT: discountValue = 10 giảm 10%
    //nếu là FIXED: discountValue = 50000 → giảm 50,000đ
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    //giới hạn số lần voucher được sử dụng
    maxUsage: {
      type: Number,
      required: true,
    },

    currentUsage: {
      type: Number,
      default: 0,
    },

    //phải tối thiểu bnhiu tiền thì mới được sdung voucher
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    validFrom: {
      type: Date,
      required: true,
    },

    validUntil: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

voucherSchema.index({ isActive: 1 });
voucherSchema.index({ validFrom: 1, validUntil: 1 });

const Voucher = mongoose.model("Voucher", voucherSchema);
export default Voucher;
