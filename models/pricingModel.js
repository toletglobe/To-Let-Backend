const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },

    lastName: {
      type: String,
      required: [true, "Last Name is required"],
      trim: true,
    },

    phoneNumber: {
      type: Number,
      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v); // Ensure phone number is exactly 10 digits
        },
        message: "Phone number should be exactly 10 digits",
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: false,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          // Simple email regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },

    stayingWith: {
      type: String,
      required: [true, "Staying with is required"],
    },

    profession: {
      type: String,
      required: [true, "Profession is required"],
    },

    dateOfVisit: {
      type: Date,
      required: [true, "Date of visit is required"],
    },

    timeSlot: {
      type: String, 
      required: [true, "Time slot is required"],
    },

  },
  { timestamps: true } 
);

const Pricing = mongoose.model("Pricing", pricingSchema);
module.exports = Pricing;