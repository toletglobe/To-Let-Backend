const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
  try {
    // console.log("Request Headers:", req.headers);
    
    // Check if the authorization header exists
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = decoded
      req.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = authenticate;
