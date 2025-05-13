// utils/sendVerificationEmail.js
const nodemailer = require("nodemailer");

const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

const sendEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    secure: true,
  });

  console.log("token:--" + verificationToken);
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

  const mailOptions = {
    from: `"To-Let Globe" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h2>Welcome to Our App 🎉</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" target="_blank" style="color:blue;">Verify Email</a>
      <p>This link will expire in 10 minutes.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(mailOptions);
};

module.exports = sendEmail;
