const { jwtDecode } = require("jwt-decode");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");

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
