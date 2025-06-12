const Review = require("../models/reviewModel");
const Property = require("../models/propertyModel"); // Add this at the top

// const { uploadOnCloudinary } = require("../utils/cloudinary");
// const multer = require("multer");
// const storage = multer.memoryStorage();
// const upload = multer({ storage });
// const uploadMedia = upload.array("media", 5);

// Create a new review
const createReview = async (req, res) => {
  try {
    const {
      property,
      userId,
      firstName,
      lastName,
      userRating,
      comments,
    } = req.body;

    const requiredFields = [property, userId, firstName, userRating, comments];
    if (requiredFields.some((field) => !field)) {
      return res.status(400).json({ message: "All required fields are missing" });
    }

    const newReview = new Review({
      property,
      userId,
      firstName,
      lastName,
      userRating: Number(userRating),
      comments,
      createdAt: new Date(),
    });

    await newReview.save();

    // 👉 Push the review ID into the property's reviews array
    await Property.findByIdAndUpdate(property, {
      $push: { reviews: newReview._id },
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get all reviews for a property
const getAllReviews = async (req, res) => {
  try {
    const { property } = req.params;

    if (!property) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const reviews = await Review.find({ property: property })
      .sort({ createdAt: -1 })
      .lean();

    if (!reviews.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        reviews: [],
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

const getAllUserReview = async (req, res) => {
  try {
    const { property } = req.params;

    if (!property) {
      return res.status(400).json({ success: false, message: "Property ID is required" });
    }

    const reviews = await Review.find({ property: property });

    const totalReviews = reviews.length;

    const averageRating =
      totalReviews > 0
        ? Math.round(
            (reviews.reduce((acc, review) => acc + review.userRating, 0) / totalReviews) * 2
          ) / 2
        : 0;

    res.status(200).json({
      success: true,
      message: "Review stats fetched successfully",
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.error("Error in getAllUserReview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch review stats",
      error: error.message,
    });
  }
};

// Update a review by ID
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRating, comments } = req.body;

    if (!userRating && !comments) {
      return res.status(400).json({
        success: false,
        message: "At least one field (userRating or comments) must be provided to update",
      });
    }

    const updatedData = {};
    if (userRating) updatedData.userRating = Number(userRating);
    if (comments) updatedData.comments = comments;

    const updatedReview = await Review.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!updatedReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
  getAllReviews,
  updateReview,
  getAllUserReview,
  // uploadMedia // reserved for future use
};
