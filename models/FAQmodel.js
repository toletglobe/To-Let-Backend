const mongoose = require("mongoose");

const faqSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    required: true,
  },
});

module.exports = mongoose.model("FAQ", faqSchema);
