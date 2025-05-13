const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendEmail } = require("../../utils/nodeMailer");
const { sendToken } = require("../../utils/sendToken");
const { ApiError } = require("../../utils/ApiError");

exports.accountSecurity = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  console.log(currentPassword, newPassword);

  if (!currentPassword || !newPassword) {
    return next(
      new ApiError(
        400,
        "Please provide both current password and new password."
      )
    );
  }
  const user = await User.findById(req.userId).select("+password");
  if (!user) {
    return next(new ApiError(400, "User not found."));
  }
  // Compare the password with the stored hash
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new ApiError(401, "Please enter the correct old password."));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 201, res);
});

exports.verifyAccount = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(new ApiError(400, "Verification token is missing."));
  }

  const user = await User.findOne({
    verificationToken: token,
    isVerified: false,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log("Invalid or expired token");
    return res
      .status(200)
      .json({ message: "Invalid or expired verification token." });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Account verified successfully!" });
});
