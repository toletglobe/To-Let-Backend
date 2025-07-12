const Property = require("../../models/propertyModel.js");
const User = require("../../models/userModel.js");
const Review = require("../../models/reviewModel.js");
const { uploadOnCloudinary } = require("../../utils/cloudinary.js");
const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiError } = require("../../utils/ApiError.js");

const VALID_COUPONS = {
      "TOLET2025": 1 // Can be used once
    };

const addProperty = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
      pincode,
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
      subscriptionPlan,
      couponStatus
    } = req.body;

    console.log("Recieved Data:", req.body);
 
    const resolvedPincode = pincode || getPincode(city, locality);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if(couponStatus === false || !coupon) return res
        .status(400)
        .json({ message: "Coupon not found. Enter the correct coupon" });

    if(coupon){
    if (couponStatus === true && coupon) {
      user.couponUsage.set(coupon, true); // Save actual coupon code
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

if (req.files || req.files.images || req.files.images.length !== 0) {
    const imageLocalPaths = req.files?.images?.map((file) => file.path);
    const uploadPromises = imageLocalPaths?.map((path) =>
      uploadOnCloudinary(path)
    );
    const imgResults = await Promise.all(uploadPromises);
    console.log("Image upload results:", imgResults);

    // Handle any failed uploads
    const failedUploads = imgResults.filter((result) => !result);
    if (failedUploads.length > 0) {
      return res.status(400).json({ message: "Failed to upload some images" });
    }

    imageUrls = imgResults?.map((result) => result.url);

    // Cloudinary file upload logic for videos
    videoUrls = null;

    if (!req.files.videos || req.files.videos.length === 0) {
      // return res.status(400).json({ message: "Video files are required" });
      console.log("No videos");
    } else {
      // Extract local paths for videos
      const videoLocalPaths = req.files?.videos?.map((file) => file.path);

      // Upload videos to Cloudinary
      const uploadVideoPromises = videoLocalPaths?.map((path) =>
        uploadOnCloudinary(path)
      );

      const videoResults = await Promise.all(uploadVideoPromises);

      const failedVideoUploads = videoResults.filter((result) => !result);
      if (failedVideoUploads.length > 0) {
        return res
          .status(400)
          .json({ message: "Failed to upload some videos" });
      }

      videoUrls = videoResults?.map((result) => result.url);
    }
  }
    // Create property data object
    const data = {
      userId,
      firstName,
      lastName,
      ownersContactNumber,
      ownersAlternateContactNumber,
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
      subscriptionPlan,
    };

    // Save property to the database
    const property = await Property.create(data);
    
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
    return res.status(500).json({ message: error.message });
  }
};

// Logic for updating properties
const updateProperty = async (req, res) => {
  try {
    const propertyId = req.params.id;
    console.log(propertyId);
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
      locality,
      pincode,
      address,
      spaceType,
      propertyType,
      area,
      coupon,
      minRent,
      maxRent,
      rent,
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
    } = req.body;
    //console.log(req.body);
    const fetchedPincode = pincode;
    //|| getPincode(city, locality);
    if (!fetchedPincode) {
      return res
        .status(400)
        .json({ message: "Pincode not found for provided city and locality." });
    }
    // Update the property fields
    property.pincode = fetchedPincode ?? property.pincode; //update pincode
    property.firstName = firstName ?? property.firstName;
    property.lastName = lastName ?? property.lastName;
    property.ownersContactNumber =
      ownersContactNumber ?? property.ownersContactNumber;
    property.ownersAlternateContactNumber =
      ownersAlternateContactNumber ?? property.ownersAlternateContactNumber;
    property.locality = locality ?? property.locality;
    property.address = address ?? property.address;
    property.area = area ?? property.area;
    property.spaceType = spaceType ?? property.spaceType;
    property.propertyType = propertyType ?? property.propertyType;
    // property.currentResidenceOfOwner =
    //   currentResidenceOfOwner ?? property.currentResidenceOfOwner;
    property.rent = rent ?? property.rent;
    // property.concession = concession ?? property.concession;
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
    //property.subscriptionAmount =
    //  subscriptionAmount ?? property.subscriptionAmount;
    //  property.commentByAnalyst = commentByAnalyst ?? property.commentByAnalyst;
    property.locationLink = locationLink ?? property.locationLink;

    // Save the updated property
    const updatedProperty = await property.save();

    // console.log(updatedProperty);

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
    const userId = user._id;
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
