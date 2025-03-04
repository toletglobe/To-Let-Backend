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
} = require("../controllers/property/index.js");

const upload = require("../middlewares/multer.js");
const jwt=require("jsonwebtoken");
const Property=require("../models/propertyModel.js")
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

router.route("/update-property/:id").patch(updateProperty); //change names and methods according to your endpoints

router.route("/:id").delete(deleteProperty); //change names and methods according to your endpoints

router.route("/:id").get(getPropertyById); //change names and methods according to your endpoints

// router.post("/add-review", addReview);

// router.delete("/reviews/:id", deleteReview);

// Get property by slug
router.get("/slug/:slug", propertyBySlug);

// router.get("/city/:city", getPropertyByCity);

// router.get("/city/:city/:locality/:area", getPropertyByArea); //http://localhost:8000/api/v1/property/city/Lucknow/Gomti Nagar/Vishesh Khand

//e.g
// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000

// GET http://localhost:8000/api/v1/property/filter?bhk=3

// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000&bhk=3&locality=Hazratganj&petsAllowed=true

/*
router.route("/").delete(addProperty); //change names and methods according to your endpoints

*/
// router.put(`/:id/availability`, async (req, res) => {
//   try {
//     // Get token from headers
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const userId = decoded.id;
//     const userRole = decoded.role;

//     // Find property
//     const property = await Property.findById(req.params.id);
//     if (!property) {
//       return res.status(404).json({ message: 'Property not found' });
//     }

//     // Authorization check
//     const isOwner = property.userId.toString() === userId;
//     const isAdmin = userRole === 'admin';
    
//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ message: 'Unauthorized access' });
//     }

//     // Validate status
//     const validStatuses = ['Available', 'Rented Out', 'NA'];
//     if (!validStatuses.includes(req.body.availabilityStatus)) {
//       return res.status(400).json({ message: 'Invalid status' });
//     }

//     // Update status
//     property.availabilityStatus = req.body.availabilityStatus;
//     await property.save();

//     res.json(property);
//   } catch (error) {
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//     res.status(500).json({ message: error.message });
//   }
// });
router.put("/:id/availability", async (req, res) => {
  try {
    // Find property by ID
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Validate status
    const validStatuses = ["Available", "Rented Out", "NA"];
    if (!validStatuses.includes(req.body.availabilityStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Update status directly
    property.availabilityStatus = req.body.availabilityStatus;
    await property.save();

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
