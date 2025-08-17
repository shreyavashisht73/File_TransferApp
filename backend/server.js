require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const cron = require("node-cron");
const { exec } = require("child_process");
console.log(" Loaded ENV:");
console.log("  GMAIL_USER:", process.env.GMAIL_USER);
console.log("  GMAIL_APP_PASSWORD length:", process.env.GMAIL_APP_PASSWORD?.length);

// Import routes
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");

const app = express();


app.use(cors());
app.use(express.json());


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);


app.get("/health", (_, res) => res.json({ ok: true }));


app.get("/", (req, res) => res.send("🚀 API is running"));


connectDB(process.env.MONGODB_URI).then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log(` Server running on http://localhost:${process.env.PORT || 5001}`);
  });
});


// Runs hourly cleanup (e.g., removing expired files)
cron.schedule("0 * * * *", () => {
  console.log(" Running hourly cleanup...");
  exec(`node ${path.join(__dirname, "utils", "cleanup.js")}`, (err, stdout, stderr) => {
    if (err) console.error("Cleanup error:", err.message);
    if (stdout) console.log(stdout.trim());
    if (stderr) console.error(stderr.trim());
  });
});

