const express = require("express");
const path = require("path");
const app = express();

require("./db"); // MongoDB connect

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("./models/User");
const Course = require("./models/Course");
const Testimonial = require("./models/Testimonial");
const Faq = require("./models/Faq");

const SECRET_KEY = "edusphere_secret";

// ================= MIDDLEWARE =================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder
app.use(express.static(path.join(__dirname, "../public")));


// ================= AUTH MIDDLEWARE =================

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Expect: Bearer TOKEN
  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/dashboard.html"));
});

// ================= AUTH ROUTES =================

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hash
    });

    await user.save();

    res.json({ success: true });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Signup error" });
  }
});


// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ success: false, message: "Wrong password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      token,
      username: user.username
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Login error" });
  }
});


// ================= API ROUTES =================

// COURSES (PROTECTED)
app.get("/api/courses", auth, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});


// TESTIMONIALS
app.get("/api/testimonials", async (req, res) => {
  try {
    const data = await Testimonial.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});


// FAQ
app.get("/api/faqs", async (req, res) => {
  try {
    const data = await Faq.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});


// ================= SERVER =================

app.listen(8000, () => {
  console.log("Server running on http://localhost:8000");
});