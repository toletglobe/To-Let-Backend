const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
  title: String,
  author: String,
  content: String,
  image: String,
  role: String,
  category: String,
  views: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: Number,
      default: 0,
    },
  ],
  date: Date,
  intro: String,
  slug: String,
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
