import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.SECRET, { expiresIn: "7d" });

//lọc dlieu user để trả về
const sanitize = (user) => ({
  _id: user._id,
  email: user.email,
  fullName: user.fullName,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
});

export const register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "email, password, fullName là bắt buộc" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email đã được đăng ký" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName: fullName.trim(),
      phone: phone?.trim() || undefined,
      role: "USER",
    });

    const token = generateToken(user._id);
    return res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email và password là bắt buộc" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: sanitize(user),
    });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({ user: sanitize(req.user) });
};
