const FAQmodel = require("../models/FAQmodel.js");

// Helper function to calculate relevance score
const calculateRelevance = (query, faq) => {
  const queryKeywords = query.toLowerCase().match(/\w+/g) || [];
  const questionKeywords = faq.question.toLowerCase().match(/\w+/g) || [];
  const tagKeywords = faq.tags.map((tag) => tag.toLowerCase());

  let questionMatches = queryKeywords.filter((word) =>
    questionKeywords.includes(word)
  ).length;
  let tagMatches = queryKeywords.filter((word) =>
    tagKeywords.includes(word)
  ).length;

  return questionMatches + tagMatches;
};

const getFAQs = async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) {
      return res.status(400).json({ message: "Please provide a query" });
    }

    const faqs = await FAQmodel.find();
    if (faqs.length === 0) {
      return res.status(404).json({
        message: "No FAQ",
      });
    }
    // rank
    const rankedFAQs = faqs
      .map((faq) => ({
        ...faq._doc,
        relevance: calculateRelevance(query, faq),
      }))
      .sort((a, b) => b.relevance - a.relevance);

    const topFAQ = rankedFAQs[0];


    if (topFAQ.relevance === 0) {
      return res.status(200).json({
        answer:
          "Sorry, I didn’t understand that.",
      });
    }
    return res.status(200).json(topFAQ);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const addFAQ = async (req, res) => {
  const { question, answer, tags } = req.body;

  if (!question || !answer || !tags || !Array.isArray(tags)) {
    return res.status(400).json({ message: "Please check fields data" });
  }

  try {
    const newFAQ = new FAQmodel({
      question,
      answer,
      tags,
    });
    await newFAQ.save();
    return res.status(201).json({ message: "FAQ added successfully", newFAQ });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

// get all faqs
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQmodel.find().populate("tags");
    return res.status(200).json(faqs);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateFAQ = async (req, res) => {
  const { id } = req.params;
  const { question, answer, tags } = req.body;

  try {
    const updatedFAQ = await FAQmodel.findByIdAndUpdate(
      id,
      { question, answer, tags },
      { new: true, runValidators: true }
    );

    if (!updatedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res
      .status(200)
      .json({ message: "FAQ updated successfully", faq: updatedFAQ });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete an FAQ
const deleteFAQ = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFAQ = await FAQmodel.findByIdAndDelete(id);

    if (!deletedFAQ) {
      return res.status(404).json({ message: "FAQ not found" });
    }

    res
      .status(200)
      .json({ message: "FAQ deleted successfully", faq: deletedFAQ });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
    console.error(error);
  }
};

module.exports = {
  getFAQs,
  addFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
};
