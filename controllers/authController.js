const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load .env values

// ✅ Token generator
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
};

// ✅ Register
const registerUser = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ success: false, message: "Name and password required." });
    }

    try {
        let existingUser = await User.findOne({ name });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "User already exists." });
        }

        // ✅ Give 3 replyCredits on registration
        const user = new User({ name, password, replyCredits: 3 });
        await user.save();

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "✅ Registered successfully.",
            token,
            user: { name: user.name, replyCredits: user.replyCredits }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ✅ Login
const loginUser = async (req, res) => {
    const { name, password } = req.body;

    if (!name || !password) {
        return res.status(400).json({ success: false, message: "Name and password required." });
    }

    try {
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid credentials." });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Wrong password." });
        }

        // ✅ Give +1 replyCredit on each successful login
        user.replyCredits += 1;
        await user.save();

        const token = generateToken(user);

        return res.json({
            success: true,
            message: "🔐 Logged in successfully.",
            token,
            user: { name: user.name, replyCredits: user.replyCredits }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = { registerUser, loginUser };
