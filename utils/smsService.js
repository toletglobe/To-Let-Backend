// msg91Service.js
const axios = require("axios");

const sendSMS = async (phoneNumber, otp) => {
  try {
    const authKey = process.env.SMS_AUTH_KEY; // Replace with your actual AuthKey
    const senderId = process.env.SMS_SENDER_KEY; // e.g., "MSGIND" or your approved ID
    const route = "4"; // Transactional route
    const country = "91";

    const message = `Your OTP is ${otp}. Valid for 5 minutes.`;

    const response = await axios.post("https://control.msg91.com/api/v5/flow/", {
      template_id: process.env.SMS_TEMPLATE_ID, // Required for DLT (template ID from MSG91)
      recipients: [
        {
          mobiles: `${country}${phoneNumber}`,
          VAR1: otp, // You can pass variables like OTP, Name etc.
        }
      ]
    }, {
      headers: {
        "authkey": authKey,
        "Content-Type": "application/json"
      }
    });

    console.log("OTP sent via MSG91:", response.data);
  } catch (err) {
    console.error("MSG91 OTP send error:", err.response?.data || err.message);
  }
};

module.exports = sendSMS;
