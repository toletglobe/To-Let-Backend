const axios = require("axios");

const getCityFromPin = async (pin) => {
  // Third-party API to fetch location details based on PIN code
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pin}`);
    
    if (response.data[0].Status === "Success") {
      const location = response.data[0].PostOffice[0];
      const city = location.District;
      const locality = location.Name;

      return { city, locality };
    } else {
      throw new Error("Invalid PIN code");
    }
  } catch (error) {
    throw new Error("Failed to fetch location from PIN code");
  }
};

module.exports = { getCityFromPin };
