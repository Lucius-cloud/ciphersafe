const jwt = require("jsonwebtoken");
const zxcvbn = require("zxcvbn");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/User");

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Password strength check
    const strength = zxcvbn(password);
    if (strength.score < 2) {
      return res.status(400).json({
        message: "Password is too weak",
        feedback: strength.feedback,
      });
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔐 Standard login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If 2FA is enabled, do not return JWT yet
    if (user.twoFactorEnabled) {
      return res.status(206).json({
        message: "2FA token required",
        twoFactorRequired: true,
        email: user.email,
      });
    }

    // ✅ If 2FA not enabled, return JWT
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: "Login successful",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Login with 2FA token after initial login
exports.loginWith2FA = async (req, res) => {
  const { email, token } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(401).json({ message: "2FA not setup for this account" });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!isValid) {
      return res.status(400).json({ message: "Invalid 2FA token" });
    }

    // If 2FA token is valid, return JWT
    const jwtToken = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: "Login successful with 2FA",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔧 Setup 2FA (QR Code + secret)
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const secret = speakeasy.generateSecret({
      name: `Ciphersafe (${user.username})`,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qr = await qrcode.toDataURL(secret.otpauth_url);

    res.json({ qr, secret: secret.base32 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Confirm 2FA setup by verifying token and enabling 2FA
exports.verify2FA = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA secret not found" });
    }

    const isVerified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!isVerified) {
      return res.status(400).json({ message: "Invalid 2FA token" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ message: "2FA successfully enabled!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
