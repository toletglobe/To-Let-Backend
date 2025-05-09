const nodemailer = require("nodemailer");
const Pricing = require("../models/pricingModel");

const pricingSubmit = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      stayingWith,
      profession, 
      college, 
      company, 
      business,
      dateOfVisit,
      timeSlot,
      comparePropertyIds, // <-- receive from frontend
    } = req.body;

    const formattedPropertyIds = comparePropertyIds?.length
    ? comparePropertyIds.map((id, idx) => `#${idx + 1}: http://localhost:5173/property/${id}`).join("\n")
    : "No properties selected.";
  
    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Mail options
    const mailOptions = {
      from: {
        name: "ToLetGlobe Form",
        address: process.env.GMAIL_USER,
      },
      to: email, // send confirmation to user
      subject: `Enquiry Confirmation - ToLetGlobe`,
      text: `
Hi ${firstName} ${lastName},

Thank you for your enquiry. We have received the following details:

First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone Number: ${phoneNumber}
Staying With: ${stayingWith}
Profession: ${profession}
Date of Visit: ${dateOfVisit}
Time Slot: ${timeSlot}

Compared Property IDs:
${formattedPropertyIds}

Our team will contact you shortly.

Best regards,
ToLetGlobe Team
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Save data to MongoDB
    const formEntry = new Pricing({
      firstName,
      lastName,
      phoneNumber,
      email,
      stayingWith,
      profession,
      college: profession === 'Student' ? college : undefined,
      company: profession === 'Working Professional' ? company : undefined,
      business: profession === 'Business' ? business : undefined,
      dateOfVisit,
      timeSlot,
      comparePropertyIds, // Save to DB if desired
    });

    await formEntry.save();

    res.status(200).send({ msg: "Form submitted successfully." });
  } catch (error) {
    console.error("Error sending mail or saving form:", error);
    res.status(500).send({ msg: "Server error. Could not send email or save form." });
  }
};

module.exports = {
  pricingSubmit,
};
