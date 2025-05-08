const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../../models/userModel");
const { asyncHandler } = require("../../utils/asyncHandler");
 const sendEmail = require("../../utils/sendEmail");
const nodemailer = require("nodemailer");

const { sendToken } = require("../../utils/sendToken");
const { ApiError } = require("../../utils/ApiError");

// User SignUp
exports.userSignup = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
    userType,
    answer,
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, "A user with this email already exists."));
  }

  // Generate email verification token
  const verificationToken = crypto.randomBytes(32).toString("hex");

  // Create new user with token fields
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber: phone,
    role,
    userType,
    firstSchool: answer,
    isVerified: false,
    verificationToken,
    verificationTokenExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
  });

  // Save user
  await user.save();

  // Send verification email
  try {
    await sendEmail(email, verificationToken);
    res.status(200).json({ message: "Verification email sent!" });
  } catch (err) {
    console.error("Email send failed:", err.message);
    return next(
      new ApiError(500, "Failed to send verification email. Please try again.")
    );
  }
});
// User Signin
exports.userSignin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email and select password
  const user = await User.findOne({ email }).select("+password");

  console.log("FOUND USER : ", user);
  if (!user) {
    return next(new ApiError(400, "User not found."));
  }

  // Compare the password with the stored hash
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ApiError(401, "Invalid credentials."));
  }

  // Check if the user has verified their account
  if (!user.isVerified) {
    return next(new ApiError(403, "Please verify your account first."));
  }
  sendToken(user, 200, res);
});

// User Signout
exports.userSignout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Successfully signed out." });
});
