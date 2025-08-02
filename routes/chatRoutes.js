const express = require("express");
const router = express.Router();
const { getChatHistory } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware"); // If using JWT

// GET /api/chat/history → returns the user's full chat history
router.get("/history", protect, getChatHistory);

module.exports = router;
