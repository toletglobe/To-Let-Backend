const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendEmail } = require("../../utils/nodeMailer");
const { sendToken } = require("../../utils/sendToken");
const { ApiError } = require("../../utils/ApiError");

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(201).json({
      message: "User not found or incorrect first school.",
    });
  }

  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  await user.save();

  const resetURL = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Password Reset Request",
    html: `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        p {
        margin-top: 5px;
          font-size: 16px;
          color: #666666;
        }
        .button {
          display: inline-block;
          padding: 12px 20px;
          font-size: 16px;
          color: #ffffff;
          background-color: #007bff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
          margin-bottom: 15px;
          text-align: center;
          cursor: pointer;
        }
        .footer {
          text-align: left;
          margin-top: 20px;
          font-size: 12px;
          color: #999999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p>Hello, ${user.firstName}</p>
        <p>
          You recently requested to reset your password. Click the button below to
          reset it:
        </p>
        <a href="${resetURL}" class="button">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Thank you,</p>
        <p>To-Let Globe</p>
        <div class="footer">
          <p>If you did not request this email, please ignore it.</p>
        </div>
      </div>
    </body>
  </html>
  `,
  };

  try {
    await sendEmail(mailOptions);
    res.status(200).json({
      message:
        "Password reset link has been sent to your email. It may take a couple of minutes for the email to reach you!",
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "Failed to send password reset email. Please try again later."
      )
    );
  }
});

// Reset Password
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ApiError(400, "Invalid or expired password reset token."));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res
    .status(200)
    .json({ message: "Your password has been reset successfully." });
});
