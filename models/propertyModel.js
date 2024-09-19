const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
  firstName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
  pin: {
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
  address: {
    type: String,
    required: true,
  },
  spaceType: {
    type: String,
    enum: ["Commercial", "Residential"],
    required: true,
  },
  petsAllowed: {
    type: Boolean,
    required: true,
  },
  preference: {
    type: String,
    enum: ["Bachelors", "Family", "Any"],
    required: true,
  },
  bachelors: {
    type: String,
    enum: ["Male", "Female", "Others"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Non-Furnished", "Semi-Furnished", "Fully-Furnished"],
    required: true,
  },
  bhk: {
    type: Number,
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
    enum: ["Western", "Indian", "Both"],
    required: true,
  },
  coolingFacility: {
    type: String,
    enum: ["AC", "Fan", "Cooler"],
    required: true,
  },
  carParking: {
    type: Boolean,
    required: true,
  },
  rent: {
    type: Number,
    required: true,
  },
  security: {
    type: String,
    required: true,
  },
  photos: {
    type: [String], // change to an array of strings to store cloudinary links in db
    required: true,
  },
  squareFeetArea: {
    type: Number,
    required: true,
  },
  appliances: {
    type: String,
    required: true,
    
  },
  amenities: {
    type: String,
    required: true,
    
  },
  aboutTheProperty: {
    type: String,
    required: true,
    
  },
  comments: {
    type: String,
    required: true,
    
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;
