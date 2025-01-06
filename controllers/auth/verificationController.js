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
  const { id } = req.params;

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) {
    return next(
      new ApiError(404, "Invalid verification link or user does not exist.")
    );
  }

  // Check if the account is already verified
  if (user.isVerified) {
    return res
      .status(200)
      .json({ message: "Your account is already verified." });
  }

  // Mark the account as verified
  user.isVerified = true;
  await user.save();
  res
    .status(200)
    .json({ message: "Account verified successfully! You can now log in." });
});
