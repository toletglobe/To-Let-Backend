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

const router = express.Router();

router.post("/register", userSignup);
router.post("/login", userSignin);
router.get("/verify/:id", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authenticate, accountSecurity);

module.exports = router;
