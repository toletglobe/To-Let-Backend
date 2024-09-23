const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    firstName: {  // userID
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastName: {    //username
      type: String,  
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre("validate", function (next) {
  this.slug = this._id.toString();
  next();
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
