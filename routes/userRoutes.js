const express = require("express");
const { getUserInfo, updateUser } = require('../controllers/userController');
const router = express();

router.get("/info", getUserInfo);
router.put('/update', updateUser);


module.exports = router
