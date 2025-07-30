const express = require("express");
const {
  forgotPassword,
  resetPassword,
  userSignup,
  userSignin,
  accountSecurity,
  verifyOTP,
  googleLogin
} = require("../controllers/auth/index");
const {verifyAccount} = require("../controllers/auth/verificationController")
const authenticate = require("../middlewares/authMiddleware");
const { forgotPasswordLimiter } = require("../middlewares/rateLimit");


const router = express.Router();

router.post("/google-login", googleLogin);
router.post("/register", userSignup);
router.post("/login", userSignin);
router.post("/verify-otp",verifyOTP);
router.get("/verify/:token", verifyAccount);
router.post("/forgot-password", forgotPasswordLimiter,forgotPassword);  //Add a rate limiter to prevent brute force attacks
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, accountSecurity);

module.exports = router;
