// Import necessary packages
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;

// Define user roles and user types
const USER_ROLES = ["admin", "content creator", "user"];
// const USER_TYPE = ["buyer", "tenant", "owner"];

// Define the User schema
const UserSchema = new mongoose.Schema(
  {
    // First Name field - required and trimmed
    firstName: {
      type: String,
      required: [true, "First Name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },

    // Email field - required, unique, and must match a valid format
    email: {
      type: String,
      required: [true, "Email is required"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
      unique: true,
      index: true, // Index for faster lookups
    },

    // Password field - not selected by default, required
    password: {
      select: false,
      type: String,
    },

    // Phone number field - must be exactly 10 digits
    phoneNumber: {
      type: String,
      // validate: {
      //   validator: function (v) {
      //     return /^\+\d{10,15}$/.test(v); // Accepts + followed by 10–15 digits
      //   },
      //   message: "Phone number must be in international format (e.g., +918408990000)",
      // },
      trim: true,
      index: true,
    },

    // Role field - must be one of the defined roles
    role: {
      type: String,
      required: true,
      enum: {
        values: USER_ROLES,
        message: "{VALUE} is not a valid user role",
      },
      default: "user",
      index: true, // If filtering users by role often
    },

    // Verification status - defaults to false
    isVerified: {
      type: Boolean,
      default: false,
      index: true, // Helps optimize verified user queries
    },

    // Fields for password reset functionality
    resetPasswordToken: {
      type: String,
      index: true, // Index for faster password reset lookups
    },

    resetPasswordExpire: {
      type: Date,
    },

    //otp new values
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },
    verificationMethod: {
      type: String,
      enum: ["email", "sms"],
      default: "email",
    },

    // Security answer for additional user security
    securityQuestionAnswer: {
      type: String,
    },

    favourites: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Property",
      default: [],
      index: true, // Index to speed up queries on user favorites
    },

    profilePicture: {
      type: String,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    coupons: {
      type: Map,
      of: Boolean,
      default: {},
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Pre-save middleware to hash the password before saving if it's modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Method to compare provided password with hashed password in the database
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

// Method to generate JWT for the user
UserSchema.methods.getJwtoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Export the User model
module.exports = mongoose.model("User", UserSchema);
