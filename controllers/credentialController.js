const crypto = require("crypto");
const zxcvbn = require("zxcvbn");
const Credential = require("../models/Credential");
const checkHIBP = require("../utils/breachChecker");

const algorithm = "aes-256-ctr";

// ✅ Secure 32-byte encryption key
const rawKey = process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef";
const secretKey = crypto.createHash("sha256").update(rawKey).digest();
console.log("Key length (should be 32):", secretKey.length);

// 🔑 Encrypt
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  return { iv: iv.toString("hex"), content: encrypted.toString("hex") };
};

// 🔓 Decrypt
const decrypt = (hash) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
};

// 📌 Create Credential
exports.createCredential = async (req, res) => {
  try {
    const { site, username, password } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ First: Check HIBP
    const breachCount = await checkHIBP(password);
    if (breachCount > 0) {
      return res.status(400).json({
        message: `This password has been found in ${breachCount} breaches. Please choose a stronger password.`,
      });
    } else if (breachCount === -1) {
      return res.status(500).json({ message: "Could not verify password safety" });
    }

    // ✅ Then: Check password strength
    const strength = zxcvbn(password);
    if (strength.score < 2) {
      return res.status(400).json({
        message: "Password is too weak",
        feedback: strength.feedback,
      });
    }

    const encryptedPassword = encrypt(password);

    const newCred = new Credential({
      user: req.user.id,
      site,
      username,
      password: encryptedPassword.content,
      iv: encryptedPassword.iv,
    });

    await newCred.save();
    res.status(201).json({ message: "Credential saved!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get Credentials
exports.getCredentials = async (req, res) => {
  try {
    const creds = await Credential.find({ user: req.user.id });

    const decryptedCreds = creds.map((c) => ({
      id: c._id,
      site: c.site,
      username: c.username,
      password: decrypt({ iv: c.iv, content: c.password }),
    }));

    res.json(decryptedCreds);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update Credential
exports.updateCredential = async (req, res) => {
  try {
    const { id } = req.params;
    const { site, username, password } = req.body;

    if (!site || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const credential = await Credential.findOne({ _id: id, user: req.user.id });
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    // ✅ First: Check HIBP
    const breachCount = await checkHIBP(password);
    if (breachCount > 0) {
      return res.status(400).json({
        message: `This password has been found in ${breachCount} breaches. Please choose a stronger password.`,
      });
    } else if (breachCount === -1) {
      return res.status(500).json({ message: "Could not verify password safety" });
    }

    // ✅ Then: Check password strength
    const strength = zxcvbn(password);
    if (strength.score < 2) {
      return res.status(400).json({
        message: "Password is too weak",
        feedback: strength.feedback,
      });
    }

    const encryptedPassword = encrypt(password);

    credential.site = site;
    credential.username = username;
    credential.password = encryptedPassword.content;
    credential.iv = encryptedPassword.iv;

    await credential.save();

    res.json({ message: "Credential updated!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete Credential
exports.deleteCredential = async (req, res) => {
  try {
    const { id } = req.params;

    const credential = await Credential.findOneAndDelete({ _id: id, user: req.user.id });
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }

    res.json({ message: "Credential deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
