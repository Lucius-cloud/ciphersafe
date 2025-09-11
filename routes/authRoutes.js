console.log("✅ authRoutes loaded");

const express = require("express");
const {
  register,
  login,
  loginWith2FA,
  setup2FA,
  verify2FA,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// 📌 Public
router.post("/register", (req, res, next) => {
  console.log("🔔 [POST] /api/auth/register endpoint HIT");
  console.log("📦 Request Body:", req.body);
  return register(req, res, next);
});

router.post("/login", (req, res, next) => {
  console.log("🔔 [POST] /api/auth/login endpoint HIT");
  console.log("📦 Request Body:", req.body);
  return login(req, res, next);
});

// 🔐 2FA Related Routes
router.post("/login/2fa", (req, res, next) => {
  console.log("🔔 [POST] /api/auth/login/2fa endpoint HIT");
  return loginWith2FA(req, res, next);
});

router.get("/2fa/setup", authMiddleware, (req, res, next) => {
  console.log("🔐 [GET] /api/auth/2fa/setup endpoint HIT by:", req.user);
  return setup2FA(req, res, next);
});

router.post("/2fa/verify", authMiddleware, (req, res, next) => {
  console.log("🔐 [POST] /api/auth/2fa/verify endpoint HIT by:", req.user);
  return verify2FA(req, res, next);
});

// 🔒 Protected route (example)
router.get("/profile", authMiddleware, (req, res) => {
  console.log("🔒 [GET] /api/auth/profile accessed by:", req.user);
  res.json({ message: "Welcome to your profile", user: req.user });
});

module.exports = router;
