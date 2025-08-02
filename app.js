const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./db");
const { registerUser, loginUser } = require("./controllers/authController");
const { protect } = require("./middleware/authMiddleware");
const { sendMessage } = require("./controllers/messageController");

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(bodyParser.json());

app.use(express.static("public"));

// Routes
app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.post("/send", protect, sendMessage); // this needs login!

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
