const express = require("express");
const {
  addFAQ,
  deleteFAQ,
  getAllFAQs,
  getFAQs,
  updateFAQ,
} = require("../controllers/FAQcontrollers.js");

const router = express.Router();

router.get("/", getFAQs);
router.post("/", addFAQ);
router.put("/:id", updateFAQ);
router.delete("/:id", deleteFAQ);

router.get("/all", getAllFAQs);

module.exports = router;
