const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ثبت نام
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // چک کن ایمیل قبلاً ثبت شده؟
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "این ایمیل قبلاً ثبت شده!" });
    }

    // پسورد رو رمزنگاری کن
    const hashedPassword = await bcrypt.hash(password, 10);

    // کاربر جدید بساز
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "ثبت نام موفق!" });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور!" });
  }
});

// لاگین
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // کاربر رو پیدا کن
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "ایمیل یا پسورد اشتباهه!" });
    }

    // پسورد رو چک کن
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "ایمیل یا پسورد اشتباهه!" });
    }

    // توکن بساز
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "خطای سرور!" });
  }
});

// گرفتن اطلاعات کاربر
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "توکن نداری!" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json(user);
  } catch {
    res.status(401).json({ message: "توکن نامعتبره!" });
  }
});

module.exports = router;
