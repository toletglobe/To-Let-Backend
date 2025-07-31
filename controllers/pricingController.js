const nodemailer = require("nodemailer");
const Pricing = require("../models/pricingModel");
const Property = require("../models/propertyModel");
const User = require("../models/userModel");

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
      comparePropertyIds,
    } = req.body;

    let formattedPropertyDetails = "No properties selected.";
    let formattedPropertyLinks = "No properties selected.";

    if (comparePropertyIds?.length) {
      const ids = Array.isArray(comparePropertyIds)
        ? comparePropertyIds
        : [comparePropertyIds];

      const selectedProperties = await Property.find({ slug: { $in: ids } });
      console.log("Fetched properties:", selectedProperties);

      if (selectedProperties.length > 0) {
        // Format for email to backend team (includes map)
        formattedPropertyDetails = selectedProperties
          .map((prop, idx) => {
            const lat = prop.latitude;
            const lng = prop.longitude;
            const locationLink =
              lat && lng
                ? `https://www.google.com/maps?q=${lat},${lng}`
                : "N/A";

            return `#${idx + 1}: https://toletglobe.in/property/${prop.slug}
Owner Contact: ${prop.ownersContactNumber || "N/A"} 
Location: ${locationLink}`;
          })
          .join("\n\n");

        // Format for email to user (just links)
        formattedPropertyLinks = selectedProperties
          .map(
            (prop, idx) =>
              `#${idx + 1}: https://toletglobe.in/property/${prop.slug}`
          )
          .join("\n");
      }
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      secure: true,
      auth: {
        user: "sales@toletglobe.in", // Changed from hardcoded to env variable
        pass: process.env.SMTP_PASS,
      },
    });

    // ===== Email to User =====
    let userMailOptions = {
      from: {
        name: "ToLetGlobe",
        address: "sales@toletglobe.in", // From sales@ for user email
      },
      to: email,
      subject: "Thanks for your enquiry – ToLetGlobe",
      text: `
Hi ${firstName} ${lastName},

Thank you for reaching out to ToLetGlobe! We've received your enquiry with the following details:

Name: ${firstName} ${lastName}
Email: ${email}
Phone Number: ${phoneNumber}
Staying With: ${stayingWith}
Profession: ${profession}
Date of Visit: ${dateOfVisit}
Time Slot: ${timeSlot}

Here are the properties you're interested in:
${formattedPropertyLinks}

Our team will be in touch with you shortly.

Warm regards,  
ToLetGlobe Team
      `,
    };

    await transporter.sendMail(userMailOptions);

    // ===== Email to Backend (Sales) =====
    let backendMailOptions = {
      from: {
        name: "ToLetGlobe Form",
        address: process.env.SMTP_USER, // From SMTP_USER for backend email
      },
      to: "sales@toletglobe.in",
      subject: `New Enquiry Submitted – ${firstName} ${lastName}`,
      text: `
${firstName} ${lastName} has submitted an enquiry. Details below:

First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Phone Number: ${phoneNumber}
Staying With: ${stayingWith}
Profession: ${profession}
College: ${college || "N/A"}
Company: ${company || "N/A"}
Business: ${business || "N/A"}
Date of Visit: ${dateOfVisit}
Time Slot: ${timeSlot}

Compared Properties:
${formattedPropertyDetails}

Regards,  
ToLetGlobe System
      `,
    };

    await transporter.sendMail(backendMailOptions);
 const formData = new URLSearchParams({
      firstName,
      lastName,
      phoneNumber,
      email,
      stayingWith,
      profession,
      dateOfVisit,
      college,
      business,
      timeSlot,
      comparePropertyIds,
      formattedPropertyLinks,
      formattedPropertyDetails,
    });

    const response = await fetch('https://script.google.com/macros/s/AKfycbwmdy0tsU2sHBhCOUWVcXFBTJniy5yFA0Ku32g2Hy-pjZupFpoYxRv8bO3WV50KTHjUrQ/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    });

  const resultText = await response.text();
  console.log('Google Sheet log:', resultText);

  await transporter.sendMail(backendMailOptions);
    res.status(200).send({ msg: "Form submitted successfully." });
  } catch (error) {
    console.error("Error sending mail or saving form:", error);
    res.status(500).send({
      msg: "Server error. Could not send email or save form.",
    });
  }
};

module.exports = {
  pricingSubmit,
};
