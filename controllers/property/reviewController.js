// const Property = require("../../models/propertyModel.js");
// const Review = require("../../models/reviewModel.js");
// const { uploadOnCloudinary } = require("../../utils/cloudinary.js");
// const { asyncHandler } = require("../../utils/asyncHandler.js");
// const { ApiError } = require("../../utils/ApiError.js");

// const addReview = async (req, res) => {
//   try {
//     const { propertyId, user, rating, comment, username } = req.body;

//     const review = new Review({
//       property: propertyId,
//       user,
//       rating,
//       comment,
//       username,
//     });
//     await review.save();

//     // Update the property with the new review
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Property not found" });
//     }

//     property.reviews.push(review._id);
//     await property.save();

//     res.status(201).json({ success: true, data: review });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// // Delete a review and remove it from the property
// const deleteReview = async (req, res) => {
//   try {
//     const reviewId = req.params.id;

//     const review = await Review.findByIdAndDelete(reviewId);
//     if (!review) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Review not found" });
//     }

//     // Remove the review from the property's reviews array
//     await Property.updateOne(
//       { _id: review.property },
//       { $pull: { reviews: reviewId } }
//     );

//     res.status(200).json({ success: true, message: "Review deleted" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   addReview,
//   deleteReview,
// };
