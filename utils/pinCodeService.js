const axios = require('axios');

const getCityFromPin = async (pin) => {
  try {
    // Fetching data from zippopotam API
    const response = await axios.get(`https://api.zippopotam.us/in/${pin}`);

    // Extract city and locality (if available)
    const city = response.data.places[0]['place name'];
    const locality = response.data.places[0]['state']; // Assuming 'state' can be used as locality

    // Check if both city and locality exist
    if (!city || !locality) {
      throw new Error('City or locality not found for the given pin code.');
    }

    return { city, locality }; // Return both city and locality as an object
  } catch (error) {
    throw new Error('Error fetching city and locality from pin code: ' + error.message);
  }
};

module.exports = { getCityFromPin };
