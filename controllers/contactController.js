const nodemailer = require("nodemailer");

//submit form info send to mail
const submitData = (req, res) => {
  try {
    console.log("Request recieved");
    const { name, email, phone, msg, topic } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      secure: true,
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: `Enquiry from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n Phone:${phone}\nTopic: ${topic}\nMessage: ${msg}\n `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        res.status(400).send("Something went wrong.");
      } else {
        console.log("Email sent: " + info.response);
        res.status(200).send("Form submitted successfully!");
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json("Internal server error");
  }
};

module.exports = {
  submitData,
};
