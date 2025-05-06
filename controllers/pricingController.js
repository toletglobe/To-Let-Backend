const nodemailer = require("nodemailer");
const Pricing = require("../models/pricingModel");

const pricingSubmit = async (req, res) => {
  console.log("Pricing form submission request received:", req.body);
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      stayingWith,
      profession,
      dateOfVisit,
      timeSlot,
    } = req.body;

    console.log("Email", email);

    // Sending the data through an email to the beckend team using the nodemailer
    const transporter = nodemailer.createTransport({
      host: "sg2plzcpnl508365.prod.sin2.secureserver.net",
      port: 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: true,
    });

    let mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: email, // Send email to the user who submitted the form
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
    
    Our team will contact you shortly.
    
    Best regards,
    ToLetGlobe Team
    `,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to user");

    mailOptions = {
      from: process.env.SMTP_USER, // Sender address
      to: process.env.SMTP_USER, // Send email to the user who submitted the form
      subject: `Enquiry Confirmation - ToLetGlobe`,
      text: `
     ${firstName} ${lastName} has submitted an enquiry,
    
    
    First Name: ${firstName}
    Last Name: ${lastName}
    Email: ${email}
    Phone Number: ${phoneNumber}
    Staying With: ${stayingWith}
    Profession: ${profession}
    Date of Visit: ${dateOfVisit}
    Time Slot: ${timeSlot}
    
    
    Best regards,
    ToLetGlobe Team
    `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully to backend team");

    // If the email is sent successfully then submit the entry into the mongodb

    // DO NOT DELETE THIS CODE
    // const formEntry = new Pricing({
    //   firstName,
    //   lastName,
    //   phoneNumber,
    //   email,
    //   stayingWith,
    //   profession,
    //   dateOfVisit,
    //   timeSlot,
    // });

    // await formEntry.save();
    res.status(200).send({ msg: "Form submitted successfully." });
  } catch (error) {
    console.error("Error sending mail or saving form:", error);
    res
      .status(500)
      .send({ msg: "Server error. Could not send email or save form." });
  }
};

module.exports = {
  pricingSubmit,
};
