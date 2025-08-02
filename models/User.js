const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  replyCredits: { type: Number, default: 0 },
  lastReceivedMessage: String,
  lastReceivedEmojis: [String],
  lastReceivedFrom: String,
  lastSentTo: String,
  initiationTimestamps: [Date],
  hasSentFirstMessage: { type: Boolean, default: false },

  // ✅ New: Full chat history tracking
  chatHistory: [
    {
      to: String,
      from: String,
      content: String,
      timestamp: Date,
      direction: String // 'sent' or 'received'
    }
  ]
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.extractEmojis = function (text) {
  return Array.from(text.match(/\p{Emoji}/gu) || []);
};

userSchema.methods.canInitiate = function () {
  if (this.initiationTimestamps.length >= 1) {
    return [false, "❌ Already started a message."];
  }
  return [true, ""];
};

module.exports = mongoose.model("User", userSchema);
