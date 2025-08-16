const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const moment = require("moment");
const File = require("../models/file"); // your Mongoose model
const { sendDownloadLink } = require("../utils/mailer"); // email helper



const router = express.Router();

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname))
});

const upload = multer({ storage });

// Upload route
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const expiryHours = Number(process.env.LINK_EXPIRY_HOURS || 24);
    const expiryTime = moment().add(expiryHours, "hours").toDate();

    const fileDoc = await File.create({
      uuid: uuidv4(),
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      filePath: req.file.path,
      expiryTime,
      senderEmail: req.body.senderEmail || "",
      receiverEmail: req.body.receiverEmail || ""
    });

    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const downloadLink = `${base}/api/files/${fileDoc.uuid}/download`;

    // Send email if receiver provided
    if (fileDoc.receiverEmail) {
      await sendDownloadLink({
        to: fileDoc.receiverEmail,
        link: downloadLink,
        originalName: fileDoc.originalName,
        expiryHours
      });
    }
    if (doc.receiverEmail) {
  try {
    await sendDownloadLink({
      to: doc.receiverEmail,
      link: directDownload,
      originalName: doc.originalName,
      expiryHours
    });
    console.log(`📧 Email sent to ${doc.receiverEmail}`);
  } catch (err) {
    console.error(`⚠️ Email send failed: ${err.message}`);
    // continue without failing
  }
}

    res.json({
      message: "File uploaded successfully",
      file: fileDoc,
      link: downloadLink
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "File upload failed" });
  }
});

module.exports = router;
