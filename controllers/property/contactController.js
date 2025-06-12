const nodemailer = require("nodemailer");
const { createHash } = require("crypto");

// Helper function to sanitize inputs and prevent header injection
const sanitizeInput = (input, maxLength = 1000) => {
  if (!input) return '';
  return String(input)
    .replace(/[\r\n]/g, '')
    .substring(0, maxLength);
};

// Helper function to validate email format
const isValidEmail = (email) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
};


const purchaseQuery = async (req, res) => {
  try {
    const { username, email, phone, query } = req.body;

    // Validate required fields
    if (!username || !email || !query) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // Create transporter with modern settings
     const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
  

    // Generate a unique message ID for tracking
    const messageId = createHash('sha256')
      .update(`${Date.now()}${email}`)
      .digest('hex');

      
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      replyTo: sanitizeInput(email), // So replies go to the user
      subject: `New enquiry from ${sanitizeInput(username, 50)}`,
      text: `
        Name: ${sanitizeInput(username)}
        Email: ${sanitizeInput(email)}
        Phone: ${sanitizeInput(phone)}
        Message: ${sanitizeInput(query)}
      `,
      html: `
        <p><strong>Name:</strong> ${sanitizeInput(username)}</p>
        <p><strong>Email:</strong> <a href="mailto:${sanitizeInput(email)}">${sanitizeInput(email)}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${sanitizeInput(phone)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${sanitizeInput(query).replace(/\n/g, '<br>')}</p>
      `,
      headers: {
        'Message-ID': `<${messageId}@yourdomain.com>`,
        'X-Mailer': 'Node.js/Nodemailer'
      }
    };

    // Send email with async/await
     transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).send("Something went wrong.");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Form submitted successfully!");
      }
    });

  } catch (error) {
    console.error("Email sending error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to send message. Please try again later.";
    if (error.code === 'EAUTH') {
      errorMessage = "Authentication failed. Please check your email service configuration.";
    } else if (error.code === 'EENVELOPE') {
      errorMessage = "Invalid email address provided.";
    }

    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  purchaseQuery
};