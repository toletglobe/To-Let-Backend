const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  userRating: {
    type: Number,
    required: true,
  },
  comments : {
    type : String, 
    required : true
  },
  // stayDuration: {
  //   type: String,
  //   required: true,
  // },
  // likesAboutLocality: {
  //   type: String,
  //   required: true,
  // },
  // dislikesAboutLocality: {
  //   type: String,
  //   required: true,
  // },
  // media: [
  //   {
  //     type: String,
  //   },
  // ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
