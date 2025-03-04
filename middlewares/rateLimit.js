const rateLimit = require("express-rate-limit");

// Forgot Password Rate Limiter (5 requests per 15 minutes)
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per window per IP
  message: { error: "Too many password reset requests. Try again later." },
  standardHeaders: true, // Sends RateLimit headers
  legacyHeaders: false, // Disable legacy headers
});

module.exports = { forgotPasswordLimiter };
