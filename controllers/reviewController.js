const multer = require("multer");
const path = require("path");
const { uploadOnCloudinary } = require("../utils/cloudinary");
const Review = require("../models/reviewModel");

// Set up storage configuration for Multer (Disk Storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

// Initialize multer with disk storage
const upload = multer({
  storage
});

// Function to create a new review
const createReview = async (req, res) => {
  try {
    const {
      property,
      userId,
      firstName,
      lastName,
      userRating,
      stayDuration,
      likesAboutLocality,
      dislikesAboutLocality,
    } = req.body;

    // Get uploaded media files
    const mediaFiles = req.files;

    // Validate required fields
    const requiredFields = [
      property,
      userId,
      firstName,
      userRating,
      stayDuration,
      likesAboutLocality,
      dislikesAboutLocality,
    ];

    if (requiredFields.some((field) => !field)) {
      return res
        .status(400)
        .json({ message: "All required fields are missing" });
    }

    // Upload media to Cloudinary
    const uploadPromises = mediaFiles.map(
      (file) => uploadOnCloudinary(file.path) 
    );

    const imgResults = await Promise.all(uploadPromises);

    // Handle any failed uploads
    const failedUploads = imgResults.filter((result) => !result);
    if (failedUploads.length > 0) {
      return res.status(400).json({ message: "Failed to upload some images" });
    }

    // Get Cloudinary URLs after successful uploads
    const imageUrls = imgResults.map((result) => result.secure_url); // Cloudinary URLs

    // Create new review document
    const newReview = new Review({
      property,
      userId,
      firstName,
      lastName,
      userRating: Number(userRating),
      stayDuration,
      likesAboutLocality,
      dislikesAboutLocality,
      media: imageUrls,
      createdAt: new Date(),
    });

    // Save to database
    await newReview.save();

    // Return response
    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const propertyId = req.params.propertyId;

    const reviews = await Review.find({ property: propertyId })
      .sort({ createdAt: -1 })
      .lean();

    if (!reviews.length) {
      return res.status(404).json({
        success: false,
        message: "No reviews found for this property",
      });
    }

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Error in getAllReviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
      error: error.message,
    });
  }
};

module.exports = {
  createReview: [upload.array("media", 5), createReview],
  getAllReviews,
};
