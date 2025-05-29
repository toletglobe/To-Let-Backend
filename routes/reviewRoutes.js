// routes/reviewRoutes.js
const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
  updateReview,
  getAllUserReview,
} = require("../controllers/reviewController");

// POST route to add a new review
router.post("/", createReview);

router.get("/users/:property", getAllUserReview);


// GET route to retrieve all reviews
router.get("/:property", getAllReviews);

router.put("/:id", updateReview); // New update route

module.exports = router;
