require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const cron = require('node-cron');
const { exec } = require('child_process');
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.get('/health', (_, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("API is running"));

// Start server
connectDB(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`🚀 Server running on port ${process.env.PORT}`)
  );
});
cron.schedule('0 * * * *', () => {
  console.log('⏰ Running hourly cleanup...');
  exec(`node ${path.join(__dirname, 'utils', 'cleanup.js')}`, (err, stdout, stderr) => {
    if (err) console.error('Cleanup error:', err.message);
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
  });
});
