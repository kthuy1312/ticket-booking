import rateLimit from "express-rate-limit";

export const bookingLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 5, // Tối đa 5 request/phút trên mỗi tài khoản
  keyGenerator: (req) => {
    return req.user ? req.user._id.toString() : req.ip;
  },
  message: {
    message:
      "Tài khoản của bạn đã gửi quá nhiều yêu cầu đặt vé. Vui lòng thử lại sau 1 phút.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
