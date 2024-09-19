const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { CLIENT_URL } = require("../utils/constants");

// Register User
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone, role, userType, answer } =
      req.body;

    // Check if user already exists
    let isUserExist = await User.findOne({ email });
    if (isUserExist) return res.status(400).json("User already exists");

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber: phone,
      role,
      userType,
      firstSchool: answer,
    });

    await user.save();

    // Send registration email
    sendRegistrationEmail(email);

    res.status(200).json("Registration success");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user)
      return res.status(400).json("No user is registered with this email");

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid credentials");

    // Generate JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.json({ 
        token, 
         user : {
         id : user.id, 
         username : user.username,
         email : user.email,
         role : user.role
       }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email, answer } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.firstSchool !== answer) {
      return res.status(404).json("User not found or invalid details");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry

    await user.save();


    const resetURL = `${CLIENT_URL}/auth/reset-password?token=${resetToken}`;

    sendPasswordResetEmail(email, resetURL);

    res.json({ message: "Password reset link sent", link: resetURL });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json("Session expired");

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    res.json("Password reset successfully");
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }
};

// Send Registration Email
function sendRegistrationEmail(email) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: false,
    });

    const mailOptions = {
      from: "toletglobetech@gmail.com",
      to: email,
      subject: "Registration Successful",
      text: "Thank you for registering with us!",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Error sending mail: ", error);
      else console.log("Email sent: " + info.response);
    });
  } catch (err) {
    console.error(err);
  }
}

// Send Password Reset Email
function sendPasswordResetEmail(email, resetURL) {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: false,
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset",
      text: `You requested a password reset. Click the link to reset your password: ${resetURL}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log("Error sending mail: ", error);
      else console.log("Email sent: " + info.response);
    });
  } catch (err) {
    console.error(err);
  }
}
