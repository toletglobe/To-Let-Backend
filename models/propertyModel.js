const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify");

const PropertySchema = new Schema({
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
  ownersContactNumber: {
    type: String,
    required: true,
  },
  ownersAlternateContactNumber: {
    type: String,
  },
  pincode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  area: {
    type: String,
  },
  address: {
    type: String,
    required: true,
  },
  spaceType: {
    type: String,
    enum: ["Commercial", "Residential", "NA"],
    required: true,
  },
  propertyType: {
    type: String,
    enum: ["House", "Flat", "PG", "Office", "Shop", "Warehouse", "NA"],
  },
  // petsAllowed: {
  //   type: String,
  //   enum: ["Yes", "No", "NA"],
  // },
  preference: {
    type: String,
    enum: ["Bachelors", "Family", "Any", "NA"],
    required: true,
  },
  bachelors: {
    type: String,
    enum: ["Girls", "Boys", "Any", "NA"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Not Furnished", "Semi Furnished", "Fully Furnished", "NA"],
    required: true,
  },
  bhk: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
    required: true,
  },
  nearestLandmark: {
    type: String,
  },
  typeOfWashroom: {
    type: String,
    enum: ["Western", "Indian", "Both", "NA"],
    required: true,
  },
  // coolingFacility: {
  //   type: String,
  //   enum: ["AC", "Fan", "Cooler", "NA"],
  // },
  // carParking: {
  //   type: String,
  //   required: true,
  // },
  rent: {
    type: String,
  },
  security: {
    type: String,
  },
  images: {
    type: [String],
    required: true,
  },
  videos: {
    type: [String],
  },
  squareFeetArea: {
    type: String,
    required: true,
  },
  appliances: {
    type: [String],
    required: true,
  },
  amenities: {
    type: [String],
    required: true,
  },
  aboutTheProperty: {
    type: String,
    required: true,
  },
  // locationLink: {
  //   type: String,
  // },
  // addressVerification: {
  //   type: String,
  // },

  availabilityStatus: {
    type: String,
    default: "Available",
    enum: ["Available", "Rented Out", "NA"],
    required: true,
  },
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  subscriptionPlan: {
    type: Number,
    enum: [299, 499, 699, 999, 1499],
  },
  slug: {
    type: String,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  nearbyLocations: {
    type: [String],
    default: [],
  },
});

// Pre-save hook to generate slug including BHK
PropertySchema.pre("save", function (next) {
  if (
    this.isModified("locality") ||
    this.isModified("propertyType") ||
    this.isModified("bhk")
  ) {
    // Generate the slug using locality, propertyType, and bhk
    this.slug = slugify(
      `${this.city} ${this.locality} ${this.propertyType} ${this.bhk}BHK ${this._id}`,
      {
        lower: true, // Lowercase slug
        strict: true, // Remove special characters
      }
    );
  }
  next();
});

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;
