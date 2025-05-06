const { Router } = require("express");
const router = Router();

const { pricingSubmit } = require("../controllers/pricingController.js");

router.route("/submit-pricing").post(pricingSubmit);

module.exports = router;
