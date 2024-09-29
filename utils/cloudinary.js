
const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.log("No file path provided");
      return null;
    }

    console.log("Uploading file:", localFilePath);

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "image",
    });

    // File uploaded successfully
    console.log("File uploaded successfully:", response.url);

    // Remove the locally saved temporary file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error.message);

    // Optional: log the error response details for debugging (if available)
    if (error.response) {
      console.error("Error response:", error.response);
    }

    // Ensure the file is removed locally in case of failure
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (unlinkError) {
        console.error("Error removing the file:", unlinkError.message);
      }
    }

    // Re-throw the error to handle it elsewhere in your application
    throw error;
  }
};

module.exports = { uploadOnCloudinary };
