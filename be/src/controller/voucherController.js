import Voucher from "../models/Voucher.js";
import VoucherUsage from "../models/VoucherUsage.js";

//ktra voucher hop le
export const validateVoucher = async (req, res) => {
  try {
    const { code, amount } = req.query;
    if (!code) {
      return res.status(400).json({ message: "code là bắt buộc" });
    }

    const orderAmount = parseFloat(amount) || 0;
    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() });

    if (!voucher)
      return res.status(404).json({ message: "Voucher không tồn tại" });

    if (!voucher.isActive)
      return res.status(400).json({ message: "Voucher không còn hiệu lực" });

    const now = new Date();
    if (now < voucher.validFrom || now > voucher.validUntil) {
      return res
        .status(400)
        .json({ message: "Voucher đã hết hạn hoặc chưa có hiệu lực" });
    }

    if (voucher.currentUsage >= voucher.maxUsage) {
      return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
    }

    if (orderAmount < voucher.minOrderAmount) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${voucher.minOrderAmount.toLocaleString()}đ để dùng voucher này`,
      });
    }

    //ktra user đã dùng chưa
    const used = await VoucherUsage.findOne({
      voucherId: voucher._id,
      userId: req.user._id,
    });
    if (used) {
      return res
        .status(400)
        .json({ message: "Bạn đã sử dụng voucher này rồi" });
    }

    //tính discount
    let discountAmount = 0;
    if (voucher.discountType === "PERCENT") {
      discountAmount = Math.round((orderAmount * voucher.discountValue) / 100);
    } else {
      discountAmount = Math.min(voucher.discountValue, orderAmount);
    }

    return res.status(200).json({
      valid: true,
      voucher: {
        _id: voucher._id,
        code: voucher.code,
        description: voucher.description,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
      },
      discountAmount,
      finalAmount: Math.max(0, orderAmount - discountAmount),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

//admin
export const createVoucher = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxUsage,
      minOrderAmount,
      validFrom,
      validUntil,
    } = req.body;

    if (
      !code ||
      !discountType ||
      discountValue == null ||
      !maxUsage ||
      !validFrom ||
      !validUntil
    ) {
      return res.status(400).json({
        message:
          "code, discountType, discountValue, maxUsage, validFrom, validUntil là bắt buộc",
      });
    }

    if (!["PERCENT", "FIXED"].includes(discountType)) {
      return res
        .status(400)
        .json({ message: "discountType phải là PERCENT hoặc FIXED" });
    }

    if (
      discountType === "PERCENT" &&
      (discountValue <= 0 || discountValue > 100)
    ) {
      return res
        .status(400)
        .json({ message: "PERCENT discount phải từ 1–100" });
    }

    const voucher = await Voucher.create({
      code: code.toUpperCase().trim(),
      description,
      discountType,
      discountValue,
      maxUsage,
      minOrderAmount: minOrderAmount || 0,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      isActive: true,
      createdBy: req.user._id,
    });

    return res.status(201).json({ message: "Tạo voucher thành công", voucher });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Mã voucher đã tồn tại" });
    }
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const listVouchers = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = {};

    //nếu kh truyền thì mặc định lấy active
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const vouchers = await Voucher.find(filter)
      .sort({ createdAt: -1 })
      .select("-__v");

    return res.status(200).json({ vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const toggleVoucherStatus = async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    voucher.isActive = !voucher.isActive;

    await voucher.save();

    return res.status(200).json({
      message: `Voucher đã được ${
        voucher.isActive ? "kích hoạt" : "vô hiệu hoá"
      }`,
      voucher,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
