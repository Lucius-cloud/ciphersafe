const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createCredential,
  getCredentials,
  updateCredential,
  deleteCredential,
} = require("../controllers/credentialController");

// Protect all credential routes with authMiddleware
router.use(authMiddleware);

// Routes
router.post("/", createCredential);
router.get("/", getCredentials);
router.put("/:id", updateCredential);
router.delete("/:id", deleteCredential);

module.exports = router;
