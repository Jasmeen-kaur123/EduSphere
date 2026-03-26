const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema({
  name: String,
  message: String
});

module.exports = mongoose.model("Testimonial", testimonialSchema);