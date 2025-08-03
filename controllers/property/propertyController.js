const Property = require("../../models/propertyModel.js");
const User = require("../../models/userModel.js");
const Review = require("../../models/reviewModel.js");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../../utils/cloudinary.js");
const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiError } = require("../../utils/ApiError.js");
const axios = require("axios");

// Import pincode data and define getPincode function
const pincodeData = require("../../data.json");

const getPincode = (city, locality) => {
  const result = pincodeData.find(
    (entry) => entry.city === city && entry.locality === locality
  );
  return result ? result.pincode : null;
};

const addProperty = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      ownerLocation,
      pincode,
      city,
      locality,
      area,
      address,
      spaceType,
      propertyType,
      preference,
      bachelors,
      type,
      bhk,
      floor,
      nearestLandmark,
      typeOfWashroom,
      // coolingFacility,
      // carParking,
      coupon,
      rent,
      security,
      minRent,
      maxRent,
      images,
      videos, //adding videos
      squareFeetArea,
      // locationLink,
      appliances,
      amenities,
      // addressVerification,
      availabilityStatus,
      aboutTheProperty,
      latitude,
      longitude,
      subscriptionPlan = 0,
      couponStatus,
    } = req.body;

    console.log("Recieved Data:", req.body);

    const resolvedPincode = pincode || getPincode(city, locality);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Bypass coupon validation if user is admin
    if (user.role !== "admin") {
      if ((couponStatus === "true" || couponStatus === true) && coupon) {
        user.coupons.set(coupon, true);
      } else {
        return res
          .status(400)
          .json({ message: "Coupon not found. Enter the correct coupon" });
      }
    }

    if (!resolvedPincode) {
      return res
        .status(400)
        .json({ message: "Pincode not found for provided city and locality." });
    }

    // Format the boolean fields correctly
    // const formattedPetsAllowed = petsAllowed === "true";
    // const formattedCarParking = carParking === "true";          Because petsAllowed and carParking now string (Yes or No) not boolean

    // Convert numeric fields from the request
    // const formattedRent = Number(rent);
    // const formattedSecurity = Number(security);
    // const formattedBhk = Number(bhk);
    // const formattedSquareFeetArea = Number(squareFeetArea);

    // Validate that numeric fields are valid numbers
    // if (
    //   isNaN(formattedRent) ||
    //   isNaN(formattedSecurity) ||
    //   isNaN(formattedBhk) ||
    //   isNaN(formattedSquareFeetArea)
    // ) {
    //   return res
    //     .status(400)
    //     .json({ message: "Numeric fields must be valid numbers" });
    // }

    const formattedRent = isNaN(Number(rent)) ? "NA" : Number(rent);
    const formattedSecurity = isNaN(Number(security)) ? "NA" : Number(security);
    const formattedBhk = isNaN(Number(bhk)) ? "NA" : Number(bhk);
    const formattedSquareFeetArea = isNaN(Number(squareFeetArea))
      ? "NA"
      : Number(squareFeetArea);

    // Cloudinary file upload logic for images
    // if (!req.files || !req.files.images || req.files.images.length === 0) {
    //   return res.status(400).json({ message: "Image files are required" });
    // }

    let imageUrls;
    let videoUrls;

    // Upload images if present
    if (req.files?.images && req.files.images.length > 0) {
      const imageLocalPaths = req.files.images.map((file) => file.path);
      const uploadPromises = imageLocalPaths.map((path) =>
        uploadOnCloudinary(path)
      );
      const imgResults = await Promise.all(uploadPromises);

      const failedUploads = imgResults.filter((result) => !result);
      if (failedUploads.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to upload some images" });
      }

      imageUrls = imgResults.map((result) => result.url);
    }

    // Upload videos if present
    if (req.files?.videos && req.files.videos.length > 0) {
      const videoLocalPaths = req.files.videos.map((file) => file.path);
      const uploadVideoPromises = videoLocalPaths.map((path) =>
        uploadOnCloudinary(path)
      );
      const videoResults = await Promise.all(uploadVideoPromises);

      const failedVideoUploads = videoResults.filter((result) => !result);
      if (failedVideoUploads.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to upload some videos" });
      }

      videoUrls = videoResults.map((result) => result.url);
    }
    // Create property data object
    const data = {
      userId,
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      ownerLocation,
      pincode: resolvedPincode,
      city,
      locality,
      area,
      address,
      spaceType,
      propertyType,
      // petsAllowed,
      preference,
      bachelors,
      type,
      bhk: formattedBhk,
      floor,
      nearestLandmark,
      typeOfWashroom,
      // coolingFacility,
      // carParking,
      coupon,
      minRent,
      maxRent,
      rent: formattedRent,
      security: formattedSecurity,
      images: imageUrls, // Changed photos to
      videos: videoUrls, // adding videos
      squareFeetArea: formattedSquareFeetArea,
      // locationLink,
      appliances,
      amenities,
      // addressVerification,
      availabilityStatus,
      aboutTheProperty,
      latitude,
      longitude,
      subscriptionPlan: Number(subscriptionPlan) || 0,
    };

    // Save property to the database
    const property = await Property.create(data);

    if (!property) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating property" });
    }

    // saving to google sheets
    const sheetPayload = {
      userId,
      firstName,
      lastName,
      city,
      locality,
      address,
      propertyType,
      bhk: formattedBhk,
      floor,
      rent: formattedRent,
      security: formattedSecurity,
      squareFeetArea: formattedSquareFeetArea,
      ownersContactNumber,
      pincode: resolvedPincode,
      spaceType,
      latitude,
      longitude,
    };

    try {
      await axios.post(
        "https://script.google.com/macros/s/AKfycbwKxNslAk6N1r0Hj2SOkLA4GVjQaAEktXGJj2gXUzE-iEMfe6D5HRCkd02atdwcRwCs/exec",
        sheetPayload
      );
    } catch (sheetErr) {
      console.error("Sheet logging failed:", sheetErr.message);
    }

    if (!property) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating property" });
    }

    await user.save(); // saving the coupon
    await property.save();
    return res.status(201).json({
      statusCode: 201,
      property,
      msg: "Property registered successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

// Logic for updating properties
const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log("Updating property:", propertyId);

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Find the property by ID
    let property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Find the user associated with this property
    const user = await User.findById(property.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User associated with this property not found" });
    }

    // Get the fields from the update form
    const {
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      ownerLocation,
      locality,
      pincode,
      city,
      address,
      spaceType,
      propertyType,
      area,
      coupon,
      minRent,
      maxRent,
      rent,
      security,
      petsAllowed,
      preference,
      bachelors,
      type,
      bhk,
      floor,
      nearestLandmark,
      typeOfWashroom,
      coolingFacility,
      carParking,
      locationLink,
      squareFeetArea,
      appliances,
      amenities,
      availabilityStatus,
      aboutTheProperty,
      latitude,
      longitude,
      subscriptionPlan,
      removedImages, // New field for tracking removed images
    } = req.body;

    console.log("Received update data:", req.body);

    // Handle removed images
    if (removedImages) {
      try {
        const removedImageUrls = JSON.parse(removedImages);
        console.log("Removing images:", removedImageUrls);

        // Delete images from Cloudinary
        const deletePromises = removedImageUrls.map((imageUrl) =>
          deleteFromCloudinary(imageUrl)
        );
        await Promise.all(deletePromises);

        // Remove images from property's images array
        property.images = property.images.filter(
          (imageUrl) => !removedImageUrls.includes(imageUrl)
        );

        console.log("Images removed successfully");
      } catch (error) {
        console.error("Error processing removed images:", error);
        return res.status(400).json({
          message: "Error processing removed images",
        });
      }
    }

    // Handle new image uploads
    if (req.files?.images && req.files.images.length > 0) {
      console.log("Uploading new images:", req.files.images.length);

      const imageLocalPaths = req.files.images.map((file) => file.path);
      const uploadPromises = imageLocalPaths.map((path) =>
        uploadOnCloudinary(path)
      );
      const imgResults = await Promise.all(uploadPromises);

      const failedUploads = imgResults.filter((result) => !result);
      if (failedUploads.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to upload some images" });
      }

      const newImageUrls = imgResults.map((result) => result.url);

      // Add new images to existing images array
      property.images = [...(property.images || []), ...newImageUrls];

      console.log("New images uploaded successfully");
    }

    // Handle video uploads (if any)
    if (req.files?.videos && req.files.videos.length > 0) {
      const videoLocalPaths = req.files.videos.map((file) => file.path);
      const uploadVideoPromises = videoLocalPaths.map((path) =>
        uploadOnCloudinary(path)
      );
      const videoResults = await Promise.all(uploadVideoPromises);

      const failedVideoUploads = videoResults.filter((result) => !result);
      if (failedVideoUploads.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to upload some videos" });
      }

      const newVideoUrls = videoResults.map((result) => result.url);
      property.videos = [...(property.videos || []), ...newVideoUrls];
    }

    // Update other property fields
    if (pincode) property.pincode = Number(pincode);
    if (firstName) property.firstName = firstName;
    if (lastName) property.lastName = lastName;
    if (ownersContactNumber) property.ownersContactNumber = ownersContactNumber;
    if (ownersAlternateContactNumber)
      property.ownersAlternateContactNumber = ownersAlternateContactNumber;
    if (ownerLocation) property.ownerLocation = ownerLocation;
    if (city) property.city = city;
    if (locality) property.locality = locality;
    if (address) property.address = address;
    if (area) property.area = area;
    if (spaceType) property.spaceType = spaceType;
    if (propertyType) property.propertyType = propertyType;
    if (rent) property.rent = rent;
    if (security) property.security = security;
    if (minRent) property.minRent = minRent;
    if (maxRent) property.maxRent = maxRent;
    if (petsAllowed !== undefined) property.petsAllowed = petsAllowed;
    if (preference) property.preference = preference;
    if (bachelors) property.bachelors = bachelors;
    if (type) property.type = type;
    if (bhk) property.bhk = bhk;
    if (floor) property.floor = floor;
    if (nearestLandmark) property.nearestLandmark = nearestLandmark;
    if (typeOfWashroom) property.typeOfWashroom = typeOfWashroom;
    if (coolingFacility) property.coolingFacility = coolingFacility;
    if (carParking !== undefined) property.carParking = carParking;
    if (locationLink) property.locationLink = locationLink;
    if (squareFeetArea) property.squareFeetArea = squareFeetArea;
    if (appliances) property.appliances = appliances;
    if (amenities) property.amenities = amenities;
    if (availabilityStatus) property.availabilityStatus = availabilityStatus;
    if (aboutTheProperty) property.aboutTheProperty = aboutTheProperty;
    if (latitude) property.latitude = latitude;
    if (longitude) property.longitude = longitude;
    if (subscriptionPlan !== undefined)
      property.subscriptionPlan = subscriptionPlan;

    // Save the updated property
    const updatedProperty = await property.save();

    console.log("Property updated successfully:", updatedProperty._id);

    return res.status(200).json({
      statusCode: 200,
      property: updatedProperty,
      message: "Property updated successfully.",
    });
  } catch (error) {
    console.error("Error updating property:", error);
    return res.status(500).json({ message: error.message });
  }
};

//logic for delete property
const deleteProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    // Find the property by ID
    let property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Check if the authenticated user is the owner of the property
    const user = await User.findById(property.userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User associated with this property not found" });
    }

    // Check if the user is authorized to delete this property
    // Assuming user ID is available in req.user from the middleware
    const userId = user._id;
    if (property.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You do not own this property" });
    }

    // Delete the property
    await Property.findByIdAndDelete(propertyId);

    return res.status(200).json({
      // statusCode: 200,
      message: "Property deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updatePropertyAvailabilityStatus = async (req, res) => {
  try {
    const { id: propertyId } = req.params;
    const { userId, availabilityStatus } = req.body;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the property by ID
    let property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return an error if the user is neither an admin nor the property owner
    if (user.role !== "admin" && property.userId.toString() !== userId) {
      return res.status(403).json({
        message:
          "Unauthorized! Only admin or propertyOwner can change the availabilityStatus.",
      });
    }

    // Allowed values for availabilityStatus
    const allowedStatuses = ["Available", "Rented Out", "NA"];

    if (!allowedStatuses.includes(availabilityStatus)) {
      return res.status(400).json({
        message: `Invalid availabilityStatus. Allowed values: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // Update availabilityStatus only if it exists in the schema
    property.availabilityStatus = availabilityStatus;
    const updatedProperty = await property.save();

    return res.status(200).json({
      statusCode: 200,
      property: updatedProperty,
      message: "Property availability status updated successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  updatePropertyAvailabilityStatus,
};
