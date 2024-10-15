// routes/reviewRoutes.js
const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
} = require("../controllers/reviewController");

// POST route to add a new review
router.post("/", createReview);

// GET route to retrieve all reviews
router.get("/:propertyId", getAllReviews);

module.exports = router;
