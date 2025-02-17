const Blog = require("../models/blogModel.js");
const { uploadOnCloudinary } = require("../utils/cloudinary.js");
const upload = require("../middlewares/multer.js");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError.js");
const client = require("../redis");


// allBlogs,updateLikes


// Route for Getting all Blogs Data
// const allBlogs = async (req, res) => {
//   try {
//     const { page = 1, limit = 6, sortBy } = req.query;
//     const skip = (page - 1) * limit;
//     let blogs;

//     if (sortBy === "trending") {
//       blogs = await Blog.find({}).
//       sort({ views: -1, likes: -1 })
//         .skip(skip)
//         .limit(parseInt(limit));
//         await client.set("blogs",blogs);
//         await client.expire("blogs",30);
//     } else if (sortBy === "latest") {
//       blogs = await Blog.find({})
//         .sort({ createdAt: 1 })
//         .skip(skip)
//         .limit(parseInt(limit));
//     } else {
//       return res.status(400).json({ error: "Invalid sortBy option" });
//     }

//     const totalBlogs = await Blog.countDocuments();
//     const totalPages = Math.ceil(totalBlogs / limit);

//     res.json({
//       data: blogs,
//       currentPage: parseInt(page),
//       totalPages,
//       totalBlogs,
//     });
//   } catch (error) {
//     console.error("Error fetching blogs:", error); // Log error for debugging
//     res.status(500).json({ error: "Failed to fetch blogs" });
//   }
// };


const allBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 9, sortBy = "latest" } = req.query;
    // console.log(page, limit, sortBy);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let blogs;
    
    // Generate a dynamic cache key based on query params
    const cacheKey = `blogs_${sortBy}_page_${page}_limit_${limit}`;
    console.log(cacheKey);
    
    // Check Redis cache
    const cacheval = await client.get(cacheKey);
    if (cacheval) {
      return res.json(JSON.parse(cacheval));
    }

    if (sortBy === "trending") {
      blogs = await Blog.find({})
        .sort({ views: -1, likes: -1 })
        .skip(skip)
        .limit(parseInt(limit));
    } else if (sortBy === "latest") {
      blogs = await Blog.find({})
<<<<<<< HEAD
        .sort({ createdAt: -1 }) // Use -1 for descending order (newest first)
=======
        .sort({ date: -1 })
>>>>>>> d4df9eee8fc83e8be262c359656a9350141ade28
        .skip(skip)
        .limit(parseInt(limit));
    } else {
      return res.status(400).json({ error: "Invalid sortBy option" });
    }

    const totalBlogs = await Blog.countDocuments();
    const totalPages = Math.ceil(totalBlogs / parseInt(limit));

    console.log(totalBlogs);

    const responseData = {
      data: blogs,
      currentPage: parseInt(page),
      totalPages,
      totalBlogs,
    };

    // Store in Redis with expiration (30 seconds)
    await client.set(cacheKey, JSON.stringify(responseData));
    await client.expire(cacheKey, 30);

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ error: "Failed to fetch blogs" });
  }
};


const createBlog = async (req, res) => {
  const dataWithCloudinaryImgUrl = { ...req.body, image: req.file.path };
  const newBlog = new Blog(dataWithCloudinaryImgUrl);
  await newBlog.save();
  res.send("success");
};

// Route to update views of a Specific blog
const updateViews = async (req, res) => {
  const { slug } = req.params;
  const blog = await Blog.findOne({ slug: slug });
  // Increment views by 1
  blog.views += 1;
  await blog.save();
  res.status(200).json({ message: "Blog views updated", blog });
};

// Route to get details of Specific Blog
const blogDetails = async (req, res) => {
  const { slug } = req.params;
  const blog = await Blog.findOne({ slug: slug });
  res.json(blog);
};

// const updateLikes = async (req, res, next) => {
//   console.log(req.params);
//   const blog = await Blog.findOne({slug:req.params.id});
//   const userId = req.userId;
//   if (!blog) {
//     return res.status(404).json({ success: false, message: "Blog not found" });
//   }
// console.log(blog)
//   const isLiked = blog.likes.includes(userId);

//   let updatedBlog;

//   if (isLiked) {
//     // If the user has already liked the blog, unlike it
//     updatedBlog = await Blog.findOneAndUpdate(
//       {slug: req.params.id},
//       { $pull: { likes: userId } },
//       { new: true }
//     );
//     res.status(200).json({
//       success: true,
//       updatedBlog,
//       message: "Blog unlike successfully.",
//     });
//   } else {
//     // If the user hasn't liked the blog, like it
//     updatedBlog = await Blog.findOneAndUpdate(
//      {slug:  req.params.id},
//       { $push: { likes: userId } },
//       { new: true }
//     );
//     res.status(200).json({
//       success: true,
//       updatedBlog,
//       message: "Blog liked successfully.",
//     });
//   }
// };

const updateLikes = async (req, res, next) => {
<<<<<<< HEAD
  try {
    console.log(req.params);
    const userId = req.userId;
    const blogSlug = req.params.id;
    const cacheKey = `blog_likes_${blogSlug}`;
=======
  console.log(req.params);
  const blog = await Blog.findOne({ slug: req.params.id });
  const userId = req.userId;
  if (!blog) {
    return res.status(404).json({ success: false, message: "Blog not found" });
  }
  console.log(blog);
  const isLiked = blog.likes.includes(userId);
>>>>>>> d4df9eee8fc83e8be262c359656a9350141ade28

    // Check Redis cache
    let blogLikes = await client.get(cacheKey);

    if (!blogLikes) {
      // If not in cache, fetch from database
      const blog = await Blog.findOne({ slug: blogSlug });
      if (!blog) {
        return res.status(404).json({ success: false, message: "Blog not found" });
      }
      blogLikes = blog.likes; // Get likes from DB
      await client.set(cacheKey, JSON.stringify(blogLikes)); // Store in Redis
      await client.expire(cacheKey, 60); // Cache expires in 60 seconds
    } else {
      blogLikes = JSON.parse(blogLikes); // Parse Redis data
    }

    const isLiked = blogLikes.includes(userId);
    let updatedBlog;

    if (isLiked) {
      // Unlike: Remove user from likes array
      updatedBlog = await Blog.findOneAndUpdate(
        { slug: blogSlug },
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      // Like: Add user to likes array
      updatedBlog = await Blog.findOneAndUpdate(
        { slug: blogSlug },
        { $push: { likes: userId } },
        { new: true }
      );
    }

    // Update Redis cache
    await client.set(cacheKey, JSON.stringify(updatedBlog.likes));
    await client.expire(cacheKey, 60);

<<<<<<< HEAD
    res.status(200).json({
      success: true,
      updatedBlog,
      message: isLiked ? "Blog unliked successfully." : "Blog liked successfully.",
=======
  if (isLiked) {
    // If the user has already liked the blog, unlike it
    updatedBlog = await Blog.findOneAndUpdate(
      { slug: req.params.id },
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
    updatedBlog = await Blog.findOneAndUpdate(
      { slug: req.params.id },
      { $push: { likes: userId } },
      { new: true }
    );
    res.status(200).json({
      success: true,
      updatedBlog,
      message: "Blog liked successfully.",
>>>>>>> d4df9eee8fc83e8be262c359656a9350141ade28
    });
  } catch (error) {
    console.error("Error updating likes:", error);
    res.status(500).json({ success: false, message: "Failed to update likes" });
  }
};


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
