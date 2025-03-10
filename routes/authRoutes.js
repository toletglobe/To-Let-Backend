const express = require("express");
const {
  forgotPassword,
  resetPassword,
  userSignup,
  userSignin,
  verifyAccount,
  accountSecurity,
} = require("../controllers/auth/index");
const authenticate = require("../middlewares/authMiddleware");
const { forgotPasswordLimiter } = require("../middlewares/rateLimit");


const router = express.Router();

router.post("/register", userSignup);
router.post("/login", userSignin);
router.get("/verify/:id", verifyAccount);
router.post("/forgot-password", forgotPasswordLimiter,forgotPassword);  //Add a rate limiter to prevent brute force attacks
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, accountSecurity);

module.exports = router;
