// utils/sendVerificationEmail.js
const nodemailer = require("nodemailer");

const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASS;

console.log("user :- " + USER);
console.log("pass :- " + PASS);



const sendEmail = async (email, verificationToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  console.log("token:--" + verificationToken);
  const verificationUrl = `http://localhost:5173/verify/${verificationToken}`;

  const mailOptions = {
    from: `"YourApp Support" <${process.env.SMTP_USER}>`,
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
