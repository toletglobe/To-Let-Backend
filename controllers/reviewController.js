const Review = require("../models/reviewModel");

// Function to create a new review
const createReview = async (req, res) => {
  try {
    const { property, userId, firstName, lastName, userRating, userComment } =
      req.body;

    // Validate input data
    if (
      !property ||
      !userId ||
      !firstName ||
      !lastName ||
      !userRating ||
      !userComment
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create a new review
    const newReview = new Review({
      property,
      userId,
      firstName,
      lastName,
      userRating,
      userComment,
    });

    console.log(newReview);

    // Save the review to the database
    await newReview.save();

    // Return the saved review in the response
    res.status(201).json({
      message: "Review created successfully",
      review: newReview,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllReviews = async (req, res) => {
  try {
    // Fetch all reviews
    const propertyId = req.params.propertyId; // Assuming the property ID is passed as a route parameter
    const fetchedReviews = await Review.find({ property: propertyId });

    res.status(200).json({ reviews: fetchedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createReview,
  getAllReviews,
};
