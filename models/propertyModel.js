const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PropertySchema = new Schema({
  ownerName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownersContactNumber: {
    type: String,
    required: true,
  },
  pin: {
    type: Number,
  },
  city: {
    type: String,
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
    type: Number,
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
  },
  security: {
    type: String,
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
});

const Property = mongoose.model("Property", PropertySchema);
module.exports = Property;
