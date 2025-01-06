const express = require("express");
const {
  allBlogs,
  updateViews,
  updateLikes,
  blogDetails,
  createBlog,
} = require("../controllers/blogController");
const authenticate = require("../middlewares/authMiddleware.js");

const upload = require("../middlewares/multer.js");

const router = express.Router();

// ?page=2&limit=5
router.route("/blogs").get(allBlogs);

router.route("/updateViews/:slug").get(updateViews);
router.route("/updateLikes/:id").get(authenticate, updateLikes);

router.route("/blogs/:slug").get(blogDetails);

router.route("/blogs/new").post(upload.single("image"), createBlog);

module.exports = router;
