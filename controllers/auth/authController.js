const jwt = require("jsonwebtoken");
const User = require("../../models/userModel");
const { asyncHandler } = require("../../utils/asyncHandler");
const { sendEmail } = require("../../utils/nodeMailer");
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

  // Create new user
  const user = new User({
    firstName,
    lastName,
    email,
    password,
    phoneNumber: phone,
    role,
    userType,
    firstSchool: answer,
    profilePicture:
      "https://res.cloudinary.com/dxhgvsse5/image/upload/v1736144347/3541871_sl0sxi.png",
  });

  await user.save();

  // Generate account verification URL
  const verificationUrl = `${process.env.BASE_URL}/api/v1/auth/verify/${user._id}`;

  // Set up email options for account verification
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: "Verify Your Account",
    html: `
           <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Account Verification</title>
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
        background-color: #28a745;
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
        Thank you for signing up. Please click the button below to verify your
        account:
      </p>
      <a href="${verificationUrl}" class="button">Verify Account</a>
      <p>
        If the button above does not work, you can also verify your account by
        clicking the following link:
      </p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
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
        "Registration successful! Check your email for account verification.",
    });
  } catch (error) {
    return next(
      new ApiError(
        500,
        "An error occurred while sending the verification email. Please try again later."
      )
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
