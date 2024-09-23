const Property = require("../models/propertyModel.js");
const Review = require("../models/reviewModel.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { getCityFromPin } = require("../utils/pinCodeService.js");


const addProperty = async (req, res) => {
  try {
    const firstName = req.firstName;

    const {
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      pin,
      city,
      locality,
      address,
      spaceType,
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
      rent,
      security,
      squareFeetArea,
      appliances,
      amenities,
      aboutTheProperty,
      comments
    } = req.body;

    if (
      !(
        firstName &&
        ownersContactNumber &&
        pin &&
        city &&
        locality &&
        address &&
        spaceType &&
        petsAllowed !== undefined &&
        preference &&
        bachelors &&
        type &&
        bhk !== undefined &&
        floor !== undefined &&
        nearestLandmark &&
        typeOfWashroom &&
        coolingFacility &&
        carParking !== undefined &&
        rent !== undefined &&
        security !==undefined &&
        squareFeetArea&&
        appliances&&
        amenities
      )
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const formattedPetsAllowed = petsAllowed === "true";
    const formattedCarParking = carParking === "true";

    const formattedRent = Number(rent);
    const formattedsecurity = Number(security);
    const formattedBhk = Number(bhk);

    if (
      isNaN(formattedRent) ||
      isNaN(formattedsecurity) ||
      isNaN(formattedBhk )
    ) {
      return res
        .status(400)
        .json({ message: "Numeric fields must be valid numbers" });
    }

    let location;
    try {
      location = await getCityFromPin(pin);
      const { city, locality } = location; // Destructure both city and locality
    } catch (error) {
      return res.status(400).json({ message: "Invalid pin code" });
    }

    /**
     * Cloudinary logic to handle multiple files
     */
    if (!req.files || !req.files.images || req.files.images.length === 0) {
      return res.status(400).json({ message: "Image files are required" });
    }

    const imageLocalPaths = req.files.images.map((file) => file.path);

    const uploadPromises = imageLocalPaths.map((path) =>
      uploadOnCloudinary(path)
    );
    const imgResults = await Promise.all(uploadPromises);

    const failedUploads = imgResults.filter((result) => !result);
    if (failedUploads.length > 0) {
      return res.status(400).json({ message: "Failed to upload some images" });
    }

    const imageUrls = imgResults.map((result) => result.url);

    const data = {
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      pin: location.pin,
      city: location.city,
      locality: location.locality,
      address,
      spaceType,
      petsAllowed: formattedPetsAllowed,
      preference,
      bachelors,
      type,
      bhk:formattedBhk ,
      floor,
      nearestLandmark,
      typeOfWashroom,
      coolingFacility,
      carParking: formattedCarParking,
      rent: formattedRent,
      security: formattedsecurity,
      photos: imageUrls,
      squareFeetArea,
      appliances,
      amenities,
      aboutTheProperty,
      comments
    };

    const property = await Property.create(data);

    if (!property) {
      return res
        .status(500)
        .json({ message: "Something went wrong while creating property" });
    }

    return res.status(201).json({
      statusCode: 201,
      property,
      msg: "Property registered successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//logic for update properties

// Logic for updating properties
const updateProperty = async (req, res) => {
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
      pin,
      city,
      locality,
      address,
      spaceType,
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
      rent,
      security,
      squareFeetArea,
      appliances,
      amenities,
      aboutTheProperty,
      comments
    } = req.body;
    console.log(req.body);

    if (pin) {
      let location;
      try {
        location = await getCityFromPin(pin);
        const { city, locality } = location;
        property.city = city;
        property.locality = locality;
        property.pin = pin;
      } catch (error) {
        return res.status(400).json({ message: "Invalid pin code" });
      }
    }

    // Update the property fields
    property.  firstName =    firstName ?? property.   firstName;
    property.  lastName =   lastName ?? property.  lastName;
    property.ownersContactNumber =
      ownersContactNumber ?? property.ownersContactNumber;
    property.ownersAlternateContactNumber =
      ownersAlternateContactNumber ?? property.ownersAlternateContactNumber;
      property.pin= pin ?? property. pin;
      property. city = city ?? property. city
    property.locality = locality ?? property.locality;
    property.address = address ?? property.address;
    property.spaceType = spaceType ?? property.spaceType;
    property.petsAllowed =
      petsAllowed !== undefined ? petsAllowed : property.petsAllowed;
    property.preference = preference ?? property.preference;
    property.bachelors = bachelors ?? property.bachelors;
    property.type = type ?? property.type;
    property.bhk = bhk ?? property.bhk;
    property.floor = floor ?? property.floor;
    property.nearestLandmark = nearestLandmark ?? property.nearestLandmark;
    property.typeOfWashroom = typeOfWashroom ?? property.typeOfWashroom;
    property.coolingFacility = coolingFacility ?? property.coolingFacility;
    property.carParking =
      carParking !== undefined ? carParking : property.carParking;
      property.rent = rent ?? property.rent;
    property.security = security ?? property.security;
    property.squareFeetArea = squareFeetArea ?? property.squareFeetArea;
    property.appliances = appliances ?? property.appliances;
    property.amenities = amenities ?? property.amenities;
    property.aboutTheProperty = aboutTheProperty ?? property.aboutTheProperty;
    property.comments = comments ?? property.comments;



    // Save the updated property
    const updatedProperty = await property.save();

    console.log(updatedProperty);

    return res.status(200).json({
      statusCode: 200,
      property: updatedProperty,
      message: "Property updated successfully.",
    });
  } catch (error) {
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
    const userId = req.user._id;
    if (property.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You do not own this property" });
    }

    // Delete the property
    await Property.findByIdAndDelete(propertyId);

    return res.status(200).json({
      statusCode: 200,
      message: "Property deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//logic for get all propertys
const GetProperty = async (req, res) => {
  try {
    const data = await Property.find({});
    //  console.log(` data length ${data.length}`)
    if (data.length <= 0) {
      return res.status(404).json({ message: "No Property found" });
    }
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPropertyById = async (req, res) => {
  try {
    const propertyId = req.params.id;

    if (!propertyId) {
      return res.status(400).json({ message: "Property ID is required" });
    }

    const property = await Property.findById(propertyId).populate("reviews");

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.status(200).json(property);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getFilteredProperties = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      bhk,
      locality,
      petsAllowed,
      preference,
      spaceType,
      bachelors,
      type,
      floor,
      nearestLandmark,
      typeOfWashroom,
      coolingFacility,
      carParking,
    } = req.query;

    const filter = {};

    // Handling price range filter
    if (minPrice) filter.rent = { ...filter.rent, $gte: Number(minPrice) };
    if (maxPrice) filter.rent = { ...filter.rent, $lte: Number(maxPrice) };

    // Handling BHK filter
    if (bhk) {
      const bhkNumber = Number(bhk);
      if (!isNaN(bhkNumber)) filter.bhk = bhkNumber;
    }

    // Handling locality filter
    if (locality) filter.locality = locality;

    // Handling petsAllowed filter
    if (petsAllowed !== undefined) filter.petsAllowed = petsAllowed === "true";

    // Handling spaceType filter
    if (spaceType) filter.spaceType = spaceType;



    // Handling preference filter
    if (preference) filter.preference = preference;

    // Handling bachelors filter
    if (bachelors) filter.bachelors = bachelors;

    // Handling type (furnishing) filter
    if (type) filter.type = type;

    // Handling floor filter
    if (floor) {
      const floorStr = String(floor);
      if (!isNaN(floorStr )) filter.floor = floorStr ;
    }

    // Handling nearestLandmark filter
    if (nearestLandmark) filter.nearestLandmark = nearestLandmark;

    // Handling typeOfWashroom filter
    if (typeOfWashroom) filter.typeOfWashroom = typeOfWashroom;

    // Handling coolingFacility filter
    if (coolingFacility) filter.coolingFacility = coolingFacility;

    // Handling carParking filter
    if (carParking !== undefined) filter.carParking = carParking === "true";


    // Fetch filtered properties from the database
    const properties = await Property.find(filter);

    // Send successful response with filtered properties
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    // Send error response
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const addReview = async (req, res) => {
  try {
    const { propertyId,  lastName, rating, comment, firstName , slug} = req.body;

    const review = new Review({
      property: propertyId,
      firstName,
      lastName,
      rating,
      comment,
      slug,
    });
    await review.save();

    // Update the property with the new review
    const property = await Property.findById(propertyId);
    if (!property) {
      return res
        .status(404)
        .json({ success: false, message: "Property not found" });
    }

    property.reviews.push(review._id);
    await property.save();

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a review and remove it from the property
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      return res
        .status(404)
        .json({ success: false, message: "Review not found" });
    }

    // Remove the review from the property's reviews array
    await Property.updateOne(
      { _id: review.property },
      { $pull: { reviews: reviewId } }
    );

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  GetProperty,
  getPropertyById,
  getFilteredProperties,
  addReview,
  deleteReview,
};

/**
 * after above done do below steps
 *
 * 1. go to (propertyRoutes.js) file
 *   - then add your route, there are some instructions and eg. follow them and also import your above method there and add there
 */
