const { Router } = require("express");
const router = Router();

const { submitData } = require("../controllers/contactController.js");

router.route("/submit-data").post(submitData);

module.exports = router;
