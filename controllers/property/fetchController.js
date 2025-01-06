const Property = require("../../models/propertyModel.js");
const Review = require("../../models/reviewModel.js");
const { uploadOnCloudinary } = require("../../utils/cloudinary.js");
const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiError } = require("../../utils/ApiError.js");

const getPropertiesByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const properties = await Property.find({ userId: userId });
    return res.status(200).json(properties);
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
      bhk,
      residential,
      commercial,
      preferenceHousing,
      genderPreference,
      houseType,
      city,
      locality,
      area,
      page = 1,
      limit = 9,
    } = req.query;

    const filter = {};

    // Handling BHK filter
    if (bhk) {
      const bhkValues = bhk
        .split(",")
        .map((b) => parseInt(b.replace(/\D/g, "")));
      filter.bhk = { $in: bhkValues };
      console.log(filter);
    }

    // Handling residential filter
    if (residential) {
      const residentialTypes = residential
        .split(",")
        .map((t) => t.replace(/^\+ /, ""));
      filter.propertyType = { $in: residentialTypes };
    }

    // Handling commercial filter
    if (commercial) {
      const commercialTypes = commercial
        .split(",")
        .map((t) => t.replace(/^\+ /, ""));
      filter.propertyType = {
        $in: [...(filter.propertyType?.$in || []), ...commercialTypes],
      };
    }

    // Handling preferenceHousing filter
    if (preferenceHousing) {
      if (preferenceHousing === "Any") {
        // No filter needed for 'Any'
      } else {
        filter.preference = preferenceHousing;
      }
    }

    // Handling genderPreference filter
    if (genderPreference && preferenceHousing !== "Family") {
      filter.genderPreference = genderPreference;
    }

    // Handling houseType filter
    if (houseType) {
      const houseTypes = houseType.split(",");
      filter.type = { $in: houseTypes };
    }

    // Handling city filter
    if (city) {
      filter.city = city;
      if (locality) {
        filter.locality = locality;
        if (area) {
          const areas = area.split(",").map((a) => a.trim());
          filter.area = { $in: areas };
        }
      }
    }

    // Pagination logic
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch filtered properties from the database with pagination
    const properties = await Property.find(filter).skip(skip).limit(limitNum);

    const total = await Property.find(filter).countDocuments(); // Total number of properties
    const totalPages = Math.ceil(total / limitNum);

    // Send successful response with filtered properties
    res.status(200).json({
      success: true,
      data: properties,
      page: pageNum,
      limit: limitNum,
      totalPages: totalPages,
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

const getPropertiesByStatus = async (req, res) => {
  try {
    const { status = "Available", page = 1, limit = 9 } = req.query;

    // Define the filter for availabilityStatus
    const filter = { availabilityStatus: status };

    // Pagination setup
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Fetch properties based on availabilityStatus with pagination
    const properties = await Property.find(filter).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      data: properties,
      page: pageNum,
      limit: limitNum,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const propertyBySlug = asyncHandler(async (req, res, next) => {
  const property = await Property.findOne({ slug: req.params.slug });
  if (!property) {
    return next(new ApiError(400, "Property not found"));
  }
  res.status(200).json(property);
});

module.exports = {
  propertyBySlug,
  getPropertyById,
  getFilteredProperties,
  getPropertiesByStatus,
  getPropertiesByUserId,
};
