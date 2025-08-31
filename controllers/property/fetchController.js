const Property = require("../../models/propertyModel.js");
const Review = require("../../models/reviewModel.js");
const { uploadOnCloudinary } = require("../../utils/cloudinary.js");
const { asyncHandler } = require("../../utils/asyncHandler.js");
const { ApiError } = require("../../utils/ApiError.js");
const path = require("path");
const fs = require("fs");

// Enhanced function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// City center coordinates for fallback
const cityCoordinates = {
  Lucknow: { lat: 26.8467, lng: 80.9462 },
  Ayodhya: { lat: 26.7922, lng: 82.1998 },
  Vellore: { lat: 12.9165, lng: 79.1325 },
  Kota: { lat: 25.2138, lng: 75.8648 },
};

// Locality coordinates for better matching
const localityCoordinates = {
  Lucknow: {
    Kamta: { lat: 26.8868, lng: 81.0586 },
    Nishatganj: { lat: 26.87, lng: 80.95 },
    Hazratganj: { lat: 26.85, lng: 80.95 },
    "Gomti Nagar": { lat: 26.85, lng: 81.0 },
    "Sushant Golf City": { lat: 26.78, lng: 81.02 },
    Khargapur: { lat: 26.83, lng: 81.03 },
    Chinhat: { lat: 26.88, lng: 81.05 },
    "Indira Nagar": { lat: 26.87, lng: 81.0 },
    Aliganj: { lat: 26.88, lng: 80.94 },
    "Vinay Khand": { lat: 26.85, lng: 81.0 },
    // Add more localities as needed
  },
  // Add other cities as needed
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

    // Build filter object (keeping existing logic)
    if (bhk) {
      const bhkValues = bhk
        .split(",")
        .map((b) => parseInt(b.replace(/\D/g, "")));
      if (bhkValues[0] === 5) {
        filter.bhk = { $gte: 5 };
      } else {
        filter.bhk = { $in: bhkValues };
      }
    }

    if (residential) {
      const residentialTypes = residential
        .split(",")
        .map((t) => t.replace(/^\+ /, ""));
      filter.propertyType = { $in: residentialTypes };
    }

    if (commercial) {
      const commercialTypes = commercial
        .split(",")
        .map((t) => t.replace(/^\+ /, ""));
      filter.propertyType = {
        $in: [...(filter.propertyType?.$in || []), ...commercialTypes],
      };
    }

    if (preferenceHousing) {
      if (preferenceHousing !== "Any") {
        filter.preference = preferenceHousing;
      }
    }

    if (genderPreference && preferenceHousing !== "Family") {
      if (genderPreference === "Others") {
        filter.bachelors = { $in: ["Boys", "Girls"] };
      } else {
        filter.bachelors = {
          $in: Array.isArray(genderPreference)
            ? genderPreference
            : [genderPreference],
        };
      }
    }

    if (houseType) {
      const houseTypes = houseType.split(",");
      filter.type = { $in: houseTypes };
    }

    // Enhanced area and locality handling
    let validAreas = null;
    const toTitleCase = (text) => {
      return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    // Load area data
    const dataFilePath = path.join(__dirname, "..", "..", "data.json");
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    const areaData = JSON.parse(rawData);

    const getValidAreas = (areas, areaData) => {
      const formattedAreas = areas.map(toTitleCase);
      return areaData
        .filter((entry) => {
          const entryArea = toTitleCase(entry.Area.trim());
          const entryAREA = toTitleCase(entry.AREA.trim());
          return (
            formattedAreas.includes(entryArea) ||
            formattedAreas.includes(entryAREA)
          );
        })
        .flatMap((entry) => {
          const mainArea = toTitleCase(entry.Area.trim());
          const neighbors = entry["Neighbouring Areas"]
            ? entry["Neighbouring Areas"]
                .split(",")
                .map((a) => toTitleCase(a.trim()))
            : [];
          return [mainArea, ...neighbors];
        });
    };

    // Handle city filter
    if (city) {
      filter.city = city;

      if (locality) {
        filter.locality = toTitleCase(locality);
      }

      if (area) {
        const areas = area.split(",").map((a) => a.trim());
        validAreas = getValidAreas(areas, areaData);
        if (validAreas.length > 0) {
          filter.area = { $in: validAreas };
        }
      }
    }

    // Get all properties matching the filter
    const allProperties = await Property.find(filter);

    // Enhanced sorting with geographic prioritization
    const sortPropertiesWithPriority = (
      properties,
      searchedLocality,
      searchedAreas,
      cityName
    ) => {
      return properties.sort((a, b) => {
        let aPriority = 0;
        let bPriority = 0;

        // 1. Availability Status Priority (Available first)
        if (
          a.availabilityStatus === "Available" &&
          b.availabilityStatus !== "Available"
        ) {
          aPriority += 1000;
        } else if (
          a.availabilityStatus !== "Available" &&
          b.availabilityStatus === "Available"
        ) {
          bPriority += 1000;
        }

        // 2. Exact Area Match Priority (highest)
        if (searchedAreas && searchedAreas.length > 0) {
          const aArea = toTitleCase(a.area || "");
          const bArea = toTitleCase(b.area || "");

          const searchedAreasFormatted = searchedAreas.map(toTitleCase);

          if (searchedAreasFormatted.includes(aArea)) aPriority += 5000;
          if (searchedAreasFormatted.includes(bArea)) bPriority += 5000;
        }

        // 3. Exact Locality Match Priority (high)
        if (searchedLocality) {
          const aLocality = toTitleCase(a.locality || "");
          const bLocality = toTitleCase(b.locality || "");
          const searchedLocalityFormatted = toTitleCase(searchedLocality);

          if (aLocality === searchedLocalityFormatted) aPriority += 300;
          if (bLocality === searchedLocalityFormatted) bPriority += 300;
        }

        // 4. Geographic Distance Priority (if coordinates are available)
        if (
          searchedLocality &&
          cityName &&
          localityCoordinates[cityName]?.[searchedLocality]
        ) {
          const searchCenter = localityCoordinates[cityName][searchedLocality];

          const aLat = parseFloat(a.latitude);
          const aLng = parseFloat(a.longitude);
          const bLat = parseFloat(b.latitude);
          const bLng = parseFloat(b.longitude);

          if (!isNaN(aLat) && !isNaN(aLng) && !isNaN(bLat) && !isNaN(bLng)) {
            const distanceA = calculateDistance(
              searchCenter.lat,
              searchCenter.lng,
              aLat,
              aLng
            );
            const distanceB = calculateDistance(
              searchCenter.lat,
              searchCenter.lng,
              bLat,
              bLng
            );

            // Closer properties get higher priority (inverse relationship)
            // Properties within 5km get bonus priority
            if (distanceA <= 2) aPriority += Math.floor((2 - distanceA) * 100);
            if (distanceB <= 2) bPriority += Math.floor((2 - distanceB) * 100);
          }

          // Add medium distance priority
          if (distanceA > 2 && distanceA <= 5)
            aPriority += Math.floor((5 - distanceA) * 50);
          if (distanceB > 2 && distanceB <= 5)
            bPriority += Math.floor((5 - distanceB) * 50);

          // Add far distance priority
          if (distanceA > 5 && distanceA <= 10)
            aPriority += Math.floor((10 - distanceA) * 20);
          if (distanceB > 5 && distanceB <= 10)
            bPriority += Math.floor((10 - distanceB) * 20);
        }

        // 5. Address-based Area/Locality Match (fallback)
        if (a.address || b.address) {
          const aAddress = (a.address || "").toLowerCase();
          const bAddress = (b.address || "").toLowerCase();

          if (
            searchedLocality &&
            aAddress.includes(searchedLocality.toLowerCase())
          ) {
            aPriority += 100;
          }
          if (
            searchedLocality &&
            bAddress.includes(searchedLocality.toLowerCase())
          ) {
            bPriority += 100;
          }

          if (searchedAreas) {
            searchedAreas.forEach((area) => {
              if (aAddress.includes(area.toLowerCase())) aPriority += 80;
              if (bAddress.includes(area.toLowerCase())) bPriority += 80;
            });
          }
        }

        // 6. Creation Date (newest first) - tiebreaker
        if (aPriority === bPriority) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }

        return bPriority - aPriority; // Higher priority first
      });
    };

    // Apply enhanced sorting
    const searchedAreas = area ? area.split(",").map((a) => a.trim()) : null;
    const sortedProperties = sortPropertiesWithPriority(
      allProperties,
      locality,
      searchedAreas,
      city
    );

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const paginatedProperties = sortedProperties.slice(skip, skip + limitNum);

    const total = allProperties.length;
    const totalPages = Math.ceil(total / limitNum);

    // Enhanced response with search context
    const response = {
      success: true,
      data: paginatedProperties,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: totalPages,
        total: total,
      },
      searchContext: {
        city: city || null,
        locality: locality || null,
        areas: searchedAreas || [],
        prioritizedResults: true,
      },
    };

    // Add search statistics
    if (locality || (searchedAreas && searchedAreas.length > 0)) {
      const stats = {
        exactAreaMatches: 0,
        exactLocalityMatches: 0,
        nearbyMatches: 0,
        otherCityMatches: 0,
      };

      sortedProperties.forEach((property) => {
        const propertyArea = toTitleCase(property.area || "");
        const propertyLocality = toTitleCase(property.locality || "");

        let isExactAreaMatch = false;
        let isExactLocalityMatch = false;

        if (searchedAreas) {
          const searchedAreasFormatted = searchedAreas.map(toTitleCase);
          if (searchedAreasFormatted.includes(propertyArea)) {
            isExactAreaMatch = true;
          }
        }

        if (locality && propertyLocality === toTitleCase(locality)) {
          isExactLocalityMatch = true;
        }

        if (isExactAreaMatch) {
          stats.exactAreaMatches++;
        } else if (isExactLocalityMatch) {
          stats.exactLocalityMatches++;
        } else if (property.city === city) {
          stats.nearbyMatches++;
        } else {
          stats.otherCityMatches++;
        }
      });

      response.searchStats = stats;
    }

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Keep other existing functions unchanged
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

    const property = await Property.findById(propertyId)
      .populate("reviews")
      .lean();

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    return res.status(200).json(property);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getPropertiesByStatus = async (req, res) => {
  try {
    const { status = "Available", page = 1, limit = 9 } = req.query;
    const filter = { availabilityStatus: status };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

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
