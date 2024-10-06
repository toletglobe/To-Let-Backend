const { jwtDecode } = require("jwt-decode");
const User = require("../models/userModel");

exports.getUserInfo = async (req, res) => {
  try {
    const { token } = req.query;

    // Check if token exists
    if (!token) {
      return res.status(401).json("Unauthorised");
    }

    // Try decoding the token
    const decoded = jwtDecode(token);
    // console.log("Decoded Token:", decoded);

    // Make sure the ID exists
    const userId = decoded.id; // Using 'id' directly based on your token structure
    // console.log("User ID:", userId);

    // Try fetching the user from MongoDB
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json("User not found");
    }

    // Send the user data
    const userData = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    res.status(200).json(userData);
  } catch (err) {
    console.error("Error in fetching user info: ", err);
    res.status(500).json("Internal server error");
  }
};

exports.updateUser = async (req, res) => {
  // console.log("Request Body: ", req.body); // Log the incoming request body
  const { userId, firstName, lastName, email, phoneNumber } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, phoneNumber },
      { new: true } // This option returns the updated document
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

