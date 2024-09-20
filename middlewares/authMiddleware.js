const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    const {token} = req.cookies;
    console.log(req.cookies);
    
    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticate;

// const jwt = require("jsonwebtoken");

// const { ApiError } = require("../utils/ApiError");
// const { asyncHandler } = require("../utils/asyncHandler");

// exports.isAuthenticated = asyncHandler(async (req, res, next) => {
//   const token = req.headers["token"];
//     if (!token) {
//       return next(new ApiError(401,"Please Login To Access The Resources!"));
//     }
//   const { id } = jwt.verify(token, process.env.JWT_SECRET);
//   req.userId = id;
//   next();
// });
