const { jwtDecode } = require("jwt-decode");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const Property = require("../models/propertyModel");

exports.getUserInfo = async (req, res) => {
  try {
    const { token } = req.query;
    console.log("reached" , token)
    if (!token) {
      return res.status(401).json("Unauthorized");
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json("User not found");
    }

    console.log(user)
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      properties:user.properties,
      role : user.role
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
exports.SaveMobile = async (req, res) => {
  const { phoneNumber } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId, "phoneNumber");
    if (!user) return res.status(404).json({ message: "User not found" });

    // if (user.phoneNumber && user.phoneNumber.trim() !== '') {
    //   return res.status(400).json({ message: "Number already found", isOpen: false });
    // }

    user.phoneNumber = phoneNumber;
    await user.save();

    res.status(200).json({ message: "User updated successfully", isOpen: false });
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


const VALID_COUPONS = {
  "TOLET2025": 1 // Can be used once, 
};

exports.checkUserCouponUsage = async (req, res) => {
  try {
    const { userId, couponCode } = req.body;
    console.log(req.body)
    console.log(couponCode)
    console.log("Checking coupon usage for user:", userId);

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user is Admin then give coupon validity true
    if(user.role === "admin"){
      return res.status(200).json({ 
        valid: true,
        message: "Coupon Applied"
      });
    }
    // If just checking current coupon usage without validation
    if (!couponCode) {
      return res.status(200).json({ result: user.couponUsage });
    }

    // Validate coupon code
    if (!VALID_COUPONS[couponCode]) {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    // Check if coupon already used
    if (user.coupons.get(couponCode)) {
      return res.status(400).json({ message: "Coupon already used" });
    }

    // Coupon is valid and not used yet
    return res.status(200).json({ 
      valid: true,
      message: "Coupon Applied"
    });

  } catch (error) {
    console.error("Error checking coupon usage:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};