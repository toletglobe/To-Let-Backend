const express = require("express");
const {
  addProperty,
  GetProperty,
  updateProperty,
  deleteProperty,
  getPropertyById,
  getFilteredProperties,
  addReview,
  deleteReview,
} = require("../controllers/propertyController.js");
const upload = require("../middlewares/multer.js");
const authenticate = require("../middlewares/authMiddleware.js");
// const { getCityFromPin } = require("../utils/pinCodeService.js");

const router = express.Router();

router.route("/add-property").post(
  authenticate,
  upload.fields([
    {
      name: "images",
      maxCount: 10, // max count
    },
  ]),
  addProperty
);

//change names and methods according to your endpoints


// New route for fetching city and locality by PIN code
// router.get("/get-location/:pin", async (req, res) => {
//   const pin = req.params.pin;

//   if (!pin) {
//     return res.status(400).json({ message: "PIN code is required" });
//   }

//   try {
//     const location = await getCityFromPin(pin);
//     return res.status(200).json({
//       city: location.city,
//       locality: location.locality,
//     });
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid PIN code" });
//   }
// });

//eg.

router.route("/filter").get(getFilteredProperties);

router.route("/").get(GetProperty); //change names and methods according to your endpoints

router.route("/update-property/:id").patch(updateProperty); //change names and methods according to your endpoints

router.route("/:id").delete(deleteProperty); //change names and methods according to your endpoints

router.route("/:id").get(getPropertyById); //change names and methods according to your endpoints

router.post("/add-review", addReview);

router.delete("/reviews/:id", deleteReview);

//e.g
// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000

// GET http://localhost:8000/api/v1/property/filter?bhk=3

// GET http://localhost:8000/api/v1/property/filter?minPrice=10000&maxPrice=20000&bhk=3&locality=Hazratganj&petsAllowed=true

/*
router.route("/").delete(addProperty); //change names and methods according to your endpoints

*/

module.exports = router;
