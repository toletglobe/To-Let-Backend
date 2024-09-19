const express = require("express");
const {
  forgotPassword,
  resetPassword,
  userSignup,
  userSignin,
  verifyAccount
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", userSignup);
router.post("/login", userSignin);
router.get("/verify/:id", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
