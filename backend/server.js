const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

const path = require('path');
// Load .env from project root (one level above backend/) so running node from any cwd still finds it.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();

async function start() {
  try {
    // Ensure DB URI is present
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI is not set. Database connection will fail. Set it in a .env file.');
    }

    await connectDB();

    app.use(cors());
    app.use(express.json());

    // Simple request logger for debugging
    app.use((req, res, next) => {
      console.log(new Date().toISOString(), req.method, req.originalUrl)
      const start = Date.now()
      res.on('finish', () => {
        console.log(new Date().toISOString(), req.method, req.originalUrl, '->', res.statusCode, `(${Date.now()-start}ms)`)
      })
      next()
    })

    app.use("/api/auth", require("./routes/authRoutes"));
    app.use("/api/courses", require("./routes/courseRoutes"));
  app.use("/api/assignments", require("./routes/assignmentRoutes"));
  app.use("/api/enroll", require("./routes/enrollRoutes"));
      // Instructor-specific endpoints
      const instructorRoutes =
  require('./routes/instructorRoutes')
      app.use("/api/instructor", instructorRoutes);

    // Simple API root for quick checks from a browser
    app.get('/', (req, res) => {
      res.send('eduSphere API is running. Use /api/auth or /api/courses');
    });

    // Error handler (JSON)
    app.use((err, req, res, next) => {
      console.error(err.stack || err);
      res.status(err.status || 500).json({ message: err.message || 'Server error' });
    });

    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  } catch (err) {
    console.error('Failed to start server:', err.message || err);
  }
}

start();