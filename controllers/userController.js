const { jwtDecode } = require("jwt-decode");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const Property = require("../models/propertyModel");

exports.getUserInfo = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(401).json("Unauthorized");
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json("User not found");
    }

    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error in fetching user info: ", err);
    res.status(500).json("Internal server error");
  }
};

exports.updateUser = async (req, res) => {
  const { userId, firstName, lastName, email, phoneNumber } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, phoneNumber },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Error updating user: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.userId; // Retrieved from middleware
    const imageFile = req.file;

    // Log to verify file reception
    console.log("Received Image File:", imageFile);

    if (!imageFile) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // Upload the image to Cloudinary
    const uploadResult = await uploadOnCloudinary(imageFile.path);

    if (!uploadResult) {
      return res
        .status(500)
        .json({ message: "Failed to upload image to Cloudinary" });
    }

    // Update the user with the new profile picture URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: uploadResult.url },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated successfully",
      profilePictureUrl: updatedUser.profilePicture,
    });
  } catch (error) {
    console.error("Error in uploading profile picture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addToFavourites = async (req, res) => {
  try {
    console.log("HIT API");
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      return res
        .status(400)
        .json({ message: "User ID and Property ID are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { favourites: propertyId } }, // $addToSet adds value to array if it doesn't exist
      { new: true } // Returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Property added to favourites successfully",
      favourites: updatedUser.favouriteProperties,
    });
  } catch (error) {
    console.error("Error updating favourite property: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getFavourites = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favouritesList = await User.findById(userId, "favourites");

    // Fetch all properties whose IDs are in the user's favourites array
    const favouriteProperties = await Property.find({
      _id: { $in: user.favourites },
    });

    res.status(200).json({
      message: "Favourites retrieved successfully",
      favourites: favouriteProperties,
      favouritesList: favouritesList,
    });
  } catch (error) {
    console.error("Error fetching favourites: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.removeFromFavourites = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;

    if (!userId || !propertyId) {
      return res
        .status(400)
        .json({ message: "User ID and Property ID are required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favourites: propertyId } }, // $pull removes the value from array
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Property removed from favourites successfully",
      favourites: updatedUser.favouriteProperties,
    });
  } catch (error) {
    console.error("Error removing property from favourites: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


const VALID_COUPONS = ["tolet8764", "TOLET2025", "DISCOUNT10"];

exports.applyCoupon = async (req, res) => {
  const { userId, couponCode } = req.body;

  if (!VALID_COUPONS.includes(couponCode)) {
    return res.status(400).json({ success: false, message: "Invalid coupon code." });
  }

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User noty found" });

    if (user.couponUsed) {
      return res.status(400).json({ success: false, message: "Coupon already used" });
    }

    user.coupon = couponCode;
    user.couponUsed = true;

    await user.save();

    res.status(200).json({ success: true, message: "Coupon applied successfully", user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};