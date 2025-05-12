const nodemailer = require("nodemailer");

// Centralized email transporter function
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send Email Utility
exports.sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  console.log(mailOptions);
  return transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(400).send("Something went wrong.");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Form submitted successfully!");
    }
  });
};
