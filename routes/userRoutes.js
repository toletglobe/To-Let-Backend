const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authenticate = require("../middlewares/authMiddleware");

const {
  uploadProfilePicture,
  updateUser,
  getUserInfo,
  addToFavourites,
  getFavourites,
  removeFromFavourites,
  SaveMobile,
  checkUserCouponUsage,
} = require("../controllers/userController");

const router = express.Router();

// Ensure the uploads directory exists
const uploadDirectory = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory); // Use the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only image files are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Route to upload the profile picture
router.post(
  "/uploadProfilePicture",
  authenticate,
  upload.single("profilePicture"),
  (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  },
  uploadProfilePicture
);

router.get("/testToken", authenticate, (req, res) => {
  res.status(200).json({ message: "Token is valid", userId: req.userId });
});

router.post("/addToFavourites", authenticate, addToFavourites);
router.post("/getFavourites", authenticate, getFavourites);
router.post("/removeFromFavourites", authenticate, removeFromFavourites);

// Other routes
router.get("/info", authenticate, getUserInfo);
router.put("/update", authenticate, updateUser);
router.put("/savemobile", authenticate, SaveMobile);
router.post("/check-coupon-usage", authenticate, checkUserCouponUsage);

module.exports = router;
