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
      ? comparePropertyIds
          .map((id, idx) => `#${idx + 1}: https://toletglobe.in/property/${id}`)
          .join("\n")
      : "No properties selected.";

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: "sales@toletglobe.in",
        pass: process.env.SMTP_PASS,
      },
    });

    // Mail options
    let mailOptions = {
      from: {
        name: "ToLetGlobe Form",
        address: "sales@toletglobe.in",
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

    // Send email to User
    await transporter.sendMail(mailOptions);

    // Save data to MongoDB
    // const formEntry = new Pricing({
    //   firstName,
    //   lastName,
    //   phoneNumber,
    //   email,
    //   stayingWith,
    //   profession,
    //   college: profession === "Student" ? college : undefined,
    //   company: profession === "Working Professional" ? company : undefined,
    //   business: profession === "Business" ? business : undefined,
    //   dateOfVisit,
    //   timeSlot,
    //   comparePropertyIds, // Save to DB if desired
    // });

    // await formEntry.save();

    mailOptions = {
      from: {
        name: "ToLetGlobe Form",
        address: "sales@toletglobe.in",
      },
      to: "sales@toletglobe.in", // send confirmation to user
      subject: `Enquiry Confirmation - ToLetGlobe`,
      text: `
${firstName} ${lastName} has submiited an enquiry. We have received the following details:

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

Best regards,
ToLetGlobe Team
      `,
    };

    // Send email to Backend Team
    await transporter.sendMail(mailOptions);

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
