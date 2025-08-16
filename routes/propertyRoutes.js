const express = require("express");
const {
  addProperty,
  GetProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getFilteredProperties,
  getPropertiesByStatus,
  propertyBySlug,
  getPropertiesByLocation,
  getPropertyByCity,
  getPropertiesByUserId,
  getPropertyByArea,
  updatePropertyAvailabilityStatus,
  purchaseQuery,
} = require("../controllers/property/index.js");

const upload = require("../middlewares/multer.js");
const Property = require("../models/propertyModel.js");
const authenticate = require("../middlewares/authMiddleware.js");
//const { BASE_URL } = require("../../Tolet-Globe-Frontend/src/constant/constant.js");
// import("../../Tolet-Globe-Frontend/src/constant/constant.js").then(({ BASE_URL }) => {
//   console.log(BASE_URL);
// });

const router = express.Router();

router.route("/add-property").post(
  authenticate,
  upload.fields([
    {
      name: "images",
      maxCount: 10, // max count
    },
    {
      name: "videos",
      maxCount: 5, // max count
    },
  ]),
  addProperty
); //change names and methods according to your endpoints
//eg.

// router.route("/location/:location").get(getPropertiesByLocation);

router.route("/user/:userId").get(getPropertiesByUserId);

router.route("/filter").get(getFilteredProperties);

router.get("/status", getPropertiesByStatus);

// http://localhost:8000/api/v1/property?page=2&limit=5
// router.route("/").get(GetProperty); //change names and methods according to your endpoints

router.route("/update-property/:id").patch(
  upload.fields([
    { name: "images", maxCount: 7 }, // Adjust the maxCount as needed
    { name: "videos", maxCount: 7 }, // Optional, if you're uploading videos
  ]),
  updateProperty
);
// router.route("/update-property/:id").patch(updateProperty); //change names and methods according to your endpoints
router
  .route("/update-property-availability-status/:id")
  .patch(updatePropertyAvailabilityStatus);

router.route("/:id").delete(deleteProperty); //change names and methods according to your endpoints

router.route("/:id").get(getPropertyById); //change names and methods according to your endpoints

// router.post("/add-review", addReview);

// router.delete("/reviews/:id", deleteReview);

// Get property by slug
router.get("/slug/:slug", propertyBySlug);

router.post("/purchasequery", purchaseQuery);
// router.get("/city/:city", getPropertyByCity);

// router.get("/city/:city/:locality/:area", getPropertyByArea); //http://localhost:8000/api/v1/property/city/Lucknow/Gomti Nagar/Vishesh Khand

//e.g
// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000

// GET http://localhost:8000/api/v1/property/filter?bhk=3

// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000&bhk=3&locality=Hazratganj&petsAllowed=true

/*
router.route("/").delete(addProperty); //change names and methods according to your endpoints

*/
// router.put("/:id/availability", async (req, res) => {
//   try {
//     // Find property by ID
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     // Validate status
//     const validStatuses = ["Available", "Rented Out", "NA"];
//     if (!validStatuses.includes(req.body.availabilityStatus)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     // Update status directly
//     property.availabilityStatus = req.body.availabilityStatus;
//     await property.save();

//     res.json(property);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
router.put("/:id/availability", async (req, res) => {
  try {
    console.log("Request received to update availability status", req.body);

    const validStatuses = ["Available", "Rented Out", "NA"];
    if (!validStatuses.includes(req.body.availabilityStatus)) {
      console.log("Invalid status received:", req.body.availabilityStatus);
      return res.status(400).json({ message: "Invalid status" });
    }

    // Use findByIdAndUpdate instead of save() to avoid full document validation
    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      { availabilityStatus: req.body.availabilityStatus },
      { new: true, runValidators: false } // new: true returns the updated document, runValidators: false skips validation
    );

    if (!updatedProperty) {
      console.log("Property not found for ID:", req.params.id);
      return res.status(404).json({ message: "Property not found" });
    }

    console.log("Property status updated successfully:", updatedProperty);

    res.json(updatedProperty);
  } catch (error) {
    console.error("Error updating property availability status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
