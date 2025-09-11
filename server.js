// server.js
console.log("✅ Server ready, routes initialized");

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware - should be before routes to log every request
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/credentials", require("./routes/credentialRoutes"));

// 2FA generate route (make sure this is NOT duplicated inside authRoutes)
app.post('/api/auth/2fa/generate', (req, res) => {
  res.json({ message: '2FA secret generated (example)' });
});

app.get("/", (req, res) => {
  res.send("🔐 CipherSafe API is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
