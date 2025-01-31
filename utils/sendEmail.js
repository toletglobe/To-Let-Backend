require('dotenv').config(); // Load environment variables from .env
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router(); // Create a router
// Create Nodemailer transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: "sg2plzcpnl508365.prod.sin2.secureserver.net",
    port: 465,
    secure: true, // Use SSL
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password
    },
  });
};

// Endpoint to handle email requests
router.post('/send-email', async (req, res) => {
  try {

    // Safely access compareProperty from the request body
    const compareProperty = typeof req.body.compareProperty === 'string'
      ? JSON.parse(req.body.compareProperty)
      : req.body.compareProperty;
    if (!compareProperty || !Array.isArray(compareProperty)) {
      console.error("compareProperty is undefined!");
      return res.status(400).json({ message: "compareProperty is required" });
    }
    console.log('Received compareProperty:',compareProperty);
    const authState = JSON.parse(req.body.authState);
    const { token, userData } = authState;
    const firstName = userData.firstName;
    const lastName = userData.lastName;
    const userId= userData.id;

    const slugs = compareProperty.map(property => property.slug);
    
    for (let i = 0; i < slugs.length; i++) {
      slugs[i] = `toletglobe.in/property-listing/${slugs[i]}`;
    }
    
    // Email content
    const emailContentHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
      }
      h2 {
        color: #4CAF50;
      }
      ul {
        margin: 0;
        padding: 0;
        list-style-type: none;
      }
      ul li {
        margin-bottom: 10px;
      }
      a {
        color: #1E90FF;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <h2>Properties Submitted by ${firstName} ${lastName} with id: ${userId}</h2>
    <p>Below is the list of properties submitted:</p>
    <ol>
      ${slugs
        .map(
          (slug) =>
            `<li><a href="${slug}" target="_blank">${slug}</a></li>`
        )
        .join("")}
    </ol>
    <p>Thank you for submitting your properties!</p>
  </body>
  </html>
`;



    // Mail options
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: "hello@toletglobe.in", // Recipient email
      subject: "Properties submitted User",
      html: emailContentHTML,
    };

    // Send the email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

module.exports = router; // Export the router
