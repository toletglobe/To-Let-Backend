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

/**
 * Deletes an image from Cloudinary using its URL
 * @param {string} imageUrl - The Cloudinary URL of the image to delete
 * @returns {boolean} - True if deletion was successful, false otherwise
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) {
      console.warn("deleteFromCloudinary: No image URL provided");
      return false;
    }

    // Extract public_id from Cloudinary URL
    const urlParts = imageUrl.split("/");
    const filenameWithExtension = urlParts[urlParts.length - 1];
    const publicId = filenameWithExtension.split(".")[0];

    // Get the folder path if it exists
    const folderPath = urlParts.slice(-2, -1)[0]; // Get the folder name
    const fullPublicId = folderPath ? `${folderPath}/${publicId}` : publicId;

    console.log("Deleting from Cloudinary:", fullPublicId);

    const result = await cloudinary.uploader.destroy(fullPublicId, {
      resource_type: "image",
    });

    console.log("Deletion successful:", result);
    return true;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    return false;
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
