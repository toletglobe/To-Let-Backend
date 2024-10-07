const Blog = require("../models/blogModel.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const upload = require("../middlewares/multer.js");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError.js");

// Route for Getting all Blogs Data
const allBlogs = async (req, res) => {
  const blogs = await Blog.find({});
  res.json(blogs);
};

const createBlog = async (req, res) => {
  const dataWithCloudinaryImgUrl = { ...req.body, image: req.file.path };
  const newBlog = new Blog(dataWithCloudinaryImgUrl);
  await newBlog.save();
  res.send("success");
};

// Route to update views of a Specific blog
const updateViews = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const blog = await Blog.findById(id);

  if (!blog) {
    return next(new ApiError(404, "Blog not found"));
  }
  // Increment views by 1
  blog.views += 1;
  await blog.save();

  res.status(200).json({ message: "Blog views updated", blog });
});

// Route to get details of Specific Blog
const blogDetails = async (req, res) => {
  const { slug } = req.params;
  const blog = await Blog.findOne({ slug: slug });
  res.json(blog);
};

const updateLikes = asyncHandler(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  const userId = req.userId;
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }

  const isLiked = blog.likes.includes(userId);

  let updatedBlog;

  if (isLiked) {
    // If the user has already liked the blog, unlike it
    updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: userId } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      updatedBlog,
      message: "Blog unlike successfully.",
    });
  } else {
    // If the user hasn't liked the blog, like it
    updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $push: { likes: userId } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      updatedBlog,
      message: "Blog liked successfully.",
    });
  }
});

// Serve static files from the uploads folder
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// console.log(
//   "Static files are being served from",
//   path.join(__dirname, "uploads")
// );
// app.use(bodyParser.json());

module.exports = {
  allBlogs,
  updateViews,
  updateLikes,
  blogDetails,
  createBlog,
};
