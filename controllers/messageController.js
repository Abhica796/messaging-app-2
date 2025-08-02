const User = require("../models/User");
const { getRandomMockingVideo } = require("../utils/emojiUtils");

const sendMessage = async (req, res) => {
  const { to, content, isInitiation = false } = req.body;
  const from = req.user.name;

  if (!to || !content) {
    return res.status(400).json({ success: false, message: "Missing 'to' or 'content'." });
  }

  const sender = await User.findOne({ name: from });
  const receiver = await User.findOne({ name: to });

  if (!receiver) {
    return res.status(404).json({ success: false, message: "Recipient not found." });
  }

  const now = new Date();

  // 💥 First-time Initiation Logic
  if (isInitiation) {
    const [canStart, reason] = sender.canInitiate();
    if (!canStart) {
      return res.json({ success: false, message: reason });
    }

    sender.initiationTimestamps.push(now);
  } else {
    // ✅ First message ever? Allow freely.
    if (!sender.hasSentFirstMessage) {
      sender.hasSentFirstMessage = true;
    } else {
      // 🪙 Require 1 token (replyCredits)
      if (sender.replyCredits <= 0) {
        return res.json({ success: false, message: "❌ No reply credits left." });
      }

      // 🔁 Restriction: Can't reply to same person who messaged you last
      if (sender.lastReceivedFrom === to) {
        return res.json({ success: false, message: "🚫 Can't reply to same person who messaged you last." });
      }

      // ⛔ Restriction: Can't message same person again
      if (sender.lastSentTo === to) {
        return res.json({ success: false, message: "🚫 Can't message same person again." });
      }

      // 🔍 Emoji rule
      if (!sender.lastReceivedEmojis.length) {
        return res.json({ success: false, message: "🚫 Last message had no emojis." });
      }

      const usedEmojis = sender.extractEmojis(content);
      const valid = usedEmojis.some(e => sender.lastReceivedEmojis.includes(e));

      if (!valid) {
        sender.replyCredits -= 1;
        await sender.save();
        const video = getRandomMockingVideo();
        return res.json({
          success: false,
          message: `💀 Emoji rule failed. Opportunity lost.\nHere's your punishment video: ${video}`
        });
      }

      // ✅ Passed emoji rule — deduct 1 token
      sender.replyCredits -= 1;
    }
  }

  // 📨 Message passes — update both users
  const receivedEmojis = receiver.extractEmojis(content);

  receiver.replyCredits += 1;
  receiver.lastReceivedMessage = content;
  receiver.lastReceivedEmojis = receivedEmojis;
  receiver.lastReceivedFrom = from;

  sender.lastSentTo = to;

  // 💾 Save chat to both users' history
  const messageData = {
    to,
    from,
    content,
    timestamp: now,
    direction: "sent"
  };

  const messageDataForReceiver = {
    to,
    from,
    content,
    timestamp: now,
    direction: "received"
  };

  sender.chatHistory.push(messageData);
  receiver.chatHistory.push(messageDataForReceiver);

  await sender.save();
  await receiver.save();

  return res.json({
    success: true,
    message: `✅ Message from ${from} to ${to} sent successfully.`
  });
};

module.exports = { sendMessage };
