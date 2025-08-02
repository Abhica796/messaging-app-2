const User = require("../models/User");

const getChatHistory = async (req, res) => {
  const username = req.user.name;

  try {
    const user = await User.findOne({ name: username });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.json({
      success: true,
      chatHistory: user.chatHistory || []
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { getChatHistory };
