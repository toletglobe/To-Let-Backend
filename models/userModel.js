// Import necessary packages
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Define user roles and user types
const USER_ROLES = ["admin", "content creator", "user"];
const USER_TYPE = ["buyer", "tenant", "owner"];

// Define the User schema
const UserSchema = new mongoose.Schema({
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
    required: [true, "Email Is Required"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
    unique: true,
  },

  // Password field - not selected by default, required
  password: {
    select: false,
    type: String,
    required: true,
  },

  // Phone number field - must be exactly 10 digits
  phoneNumber: {
    type: String,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Ensure phone number is exactly 10 digits
      },
      message: "Phone number should be exactly 10 digits",
    },
    trim: true,
  },

  // Role field - must be one of the defined roles
  role: {
    type: String,
    required: true,
    enum: {
      values: USER_ROLES,
      message: "{VALUE} is not a valid user role",
      default: "user", // Default to 'user' if not provided
    },
  },

  // User type field - must be one of the defined types
  userType: {
    type: String,
    enum: {
      values: USER_TYPE,
      message: "{VALUE} is not a valid user type",
    },
  },

  // Verification status - defaults to false
  isVerified: {
    type: Boolean,
    default: false,
  },

  // Security question for password recovery
  firstSchool: {
    type: String,
    required: true,
  },

  // Fields for password reset functionality
  resetPasswordToken: {
    type: String,
  }, // Token for password reset
  resetPasswordExpire: {
    type: Date,
  }, // Token expiration time

  // Security answer for additional user security
  securityQuestionAnswer: {
    type: String,
  },

  properties: {
    type: [mongoose.Schema.Types.ObjectId],
  },

  profilePicture: {
    type: String,
  },
});

// Pre-save middleware to hash the password before saving if it's modified
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) {
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
