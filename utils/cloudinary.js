const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a file to Cloudinary and returns the secure URL and public ID.
 * Automatically deletes the local file after upload or error.
 * @param {string} localFilePath - Path to the file stored locally (by multer).
 * @returns {{ url: string, public_id: string } | null}
 */
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.warn("uploadOnCloudinary: No file path provided");
      return null;
    }

    console.log("Uploading file to Cloudinary:", localFilePath);

    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically handles image/video
    });

    console.log("Upload successful:", result.secure_url);

    // Cleanup local file
    fs.unlinkSync(localFilePath);

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // Attempt to delete temp file if upload failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

module.exports = { uploadOnCloudinary };
