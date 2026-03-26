const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();

// Models
const User = require("./models/User");
const Course = require("./models/Course");
const Testimonial = require("./models/Testimonial");
const Faq = require("./models/Faq");

// ENV / CONFIG
const SECRET_KEY = process.env.JWT_SECRET || "edusphere_secret";
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/edusphere";
const port = process.env.PORT || 4000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// ================= AUTH MIDDLEWARE =================
function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ================= ROUTES =================

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/pages/dashboard.html"));
});

// ===== AUTH =====

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hash,
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
      username: user.username,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Login error" });
  }
});

// ===== API =====

// COURSES (Protected)
app.use("/api/courses", auth, require("./routes/courses"));

// Other APIs
app.get("/api/testimonials", async (req, res) => {
  try {
    const data = await Testimonial.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

app.get("/api/faqs", async (req, res) => {
  try {
    const data = await Faq.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
});

// Extra routes
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/exams", require("./routes/exams"));
app.use("/api/students", require("./routes/students"));
app.use("/api/storage", require("./routes/storage"));

// ================= FRONTEND =================
const frontendPath = path.join(__dirname, "..", "..", "frontend", "instructor-dashboard");
app.use(express.static(frontendPath));

// SPA fallback
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ================= DB CONNECT + SERVER START =================
mongoose
  .connect(mongoUri)
  .then(() => {
    console.log("✅ MongoDB Connected");

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });