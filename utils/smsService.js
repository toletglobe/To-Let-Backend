const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = require('twilio')(accountSid, authToken);

exports.sendOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your To-Let Globe verification code is: ${otp}`,
      from: twilioPhoneNumber,
      to: phoneNumber
    });
    console.log(`OTP sent to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};