const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authControllers");
const { getProfile } = require("../controllers/authControllers");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/profile", authMiddleware, getProfile);

// Register
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
  ],
  register
);

// Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  login
);

module.exports = router;
