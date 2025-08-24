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
    // Example URL: https://res.cloudinary.com/dxhgvsse5/image/upload/v1756061707/mtcy4ri7gbvmkwbh6hed.jpg
    const urlMatch = imageUrl.match(
      /\/upload\/(?:v\d+\/)?([^\/]+)\.(jpg|jpeg|png|gif|webp|mp4|mov|avi)$/i
    );

    if (!urlMatch) {
      console.warn("Could not extract public_id from URL:", imageUrl);
      return false;
    }

    const publicId = urlMatch[1];
    const fileExtension = urlMatch[2].toLowerCase();

    // Determine resource type based on file extension
    let resourceType = "image"; // default
    if (["mp4", "mov", "avi"].includes(fileExtension)) {
      resourceType = "video";
    }

    console.log(
      "Deleting from Cloudinary:",
      publicId,
      "Resource type:",
      resourceType
    );

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    console.log("Deletion successful:", result);
    return result.result === "ok" || result.result === "not found";
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    return false;
  }
};

module.exports = { uploadOnCloudinary, deleteFromCloudinary };
