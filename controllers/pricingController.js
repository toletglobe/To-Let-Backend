const nodemailer = require("nodemailer");
const Pricing = require("../models/pricingModel");

const pricingSubmit = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      phoneNumber,
      alternativeNumber, 
      stayingWith,
      profession,
      dateOfVisit,
      timeSlot,
    } = req.body;

    // Sending the data through an email to the beckend team using the nodemailer 
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: {
        name: "ToLetGlobe Form",
        address: process.env.GMAIL_USER,
      },
      to: process.env.GMAIL_RECEIVER,
      subject: `Enquiry from ${firstName} ${lastName}`,
      text: `
First Name: ${firstName}
Last Name: ${lastName}
AlternativeNumber: ${alternativeNumber}
Phone Number: ${phoneNumber}
Staying With: ${stayingWith}
Profession: ${profession}
Date of Visit: ${dateOfVisit}
Time Slot: ${timeSlot}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // If the email is sent successfully then submit the entry into the mongodb
    const formEntry = new Pricing({
      firstName,
      lastName,
      phoneNumber,
      alternativeNumber,
      stayingWith,
      profession,
      dateOfVisit,
      timeSlot,
    });

    await formEntry.save();
    res.status(200).send({ msg: "Form submitted successfully." });
} catch (error) {
    console.error("Error sending mail or saving form:", error);
    res.status(500).send({ msg: "Server error. Could not send email or save form." });
  }
};

module.exports = {
  pricingSubmit
};
