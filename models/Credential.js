const mongoose = require("mongoose");

const credentialSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  site: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }, // encrypted before saving
  iv: { type: String, required: true },       // store IV for decryption
}, { timestamps: true });

module.exports = mongoose.model("Credential", credentialSchema);
