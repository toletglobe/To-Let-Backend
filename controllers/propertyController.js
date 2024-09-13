const Property = require("../models/propertyModel.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const { getCityFromPin } = require("../utils/pinCodeService.js");

const addProperty = async (req, res) => {
  try {
    const {
      ownerName,
      ownersContactNumber,
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
      smokersPreference,
      comments,
    } = req.body;

    if (
      !(
        ownerName ||
        ownersContactNumber ||
        pin||
        city||
        locality ||
        address ||
        spaceType ||
        petsAllowed ||
        preference ||
        bachelors ||
        type ||
        bhk ||
        floor ||
        nearestLandmark ||
        typeOfWashroom ||
        coolingFacility ||
        carParking ||
        rent||
        security||
        squareFeetArea||
        appliances||
        amenities||
        aboutTheProperty||
        comments
      )
    ) {
      return res.status(400).json({ message: "All fields are required" });
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
      ownerName,
      ownersContactNumber,
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
      comments,
      photos: imageUrls,
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
      ownerName,
      ownersContactNumber,
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
      comments,
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
    property.ownerName = ownerName ?? property.ownerName;
    property.ownersContactNumber = ownersContactNumber ?? property.ownersContactNumber;
    property.pin =   property.pin?? property.pin;
    property.city =   property.city?? property.city;
    property.locality = locality ?? property.locality;
    property.address = address ?? property.address;
    property.spaceType = spaceType ?? property.spaceType;
    property.petsAllowed =petsAllowed !== undefined ? petsAllowed : property.petsAllowed;
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
    property.rent =   property.rent?? property.rent;
    property.security =   property.security?? property.security;
    property.commentByAnalyst = commentByAnalyst ?? property.commentByAnalyst;
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

    const property = await Property.findById(propertyId);

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
    const { minPrice, maxPrice, bhk, locality, petsAllowed } = req.query;
    const filter = {};

    if (minPrice) filter.rent = { ...filter.rent, $gte: Number(minPrice) };
    if (maxPrice) filter.rent = { ...filter.rent, $lte: Number(maxPrice) };
    if (bhk) filter.bhk = Number(bhk);
    if (locality) filter.locality = locality;
    if (petsAllowed !== undefined) filter.petsAllowed = petsAllowed === "true";

    const properties = await Property.find(filter);
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  addProperty,
  updateProperty,
  deleteProperty,
  GetProperty,
  getPropertyById,
  getFilteredProperties,
};

/**
 * after above done do below steps
 *
 * 1. go to (propertyRoutes.js) file
 *   - then add your route, there are some instructions and eg. follow them and also import your above method there and add there
 */
