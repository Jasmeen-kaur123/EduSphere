require("./db");

const Course = require("./models/Course");
const Testimonial = require("./models/Testimonial");
const Faq = require("./models/Faq");

(async () => {

await Course.insertMany([
  { title: "Web Development", instructor: "John" },
  { title: "React Basics", instructor: "Alice" }
]);

await Testimonial.insertMany([
  { name: "Riya", message: "Amazing platform" },
  { name: "Aman", message: "Best for placements" }
]);

await Faq.insertMany([
  { question: "Is it flexible?", answer: "Yes" },
  { question: "Good for jobs?", answer: "Absolutely" }
]);

console.log("Data Inserted");
process.exit();

})();