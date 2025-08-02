const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/api/register", registerUser);
router.post("/api/login", loginUser);

module.exports = router;
