const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    // Throw the error to let the caller decide how to handle startup failures.
    throw error;
  }
};

module.exports = connectDB;