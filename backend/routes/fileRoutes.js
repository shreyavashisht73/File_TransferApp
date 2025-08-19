const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { sendDownloadLink, sendFileToSender } = require('../utils/mailer');

const router = express.Router();

/** Ensure uploads folder exists */
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

/** Multer storage config */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/** POST /api/files/upload -> upload file */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: ' No file uploaded' });

    const expiryHours = Number(process.env.LINK_EXPIRY_HOURS || 24);
    const expiryTime = moment().add(expiryHours, 'hours').toDate();

    const doc = await File.create({
      uuid: uuidv4(),
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      filePath: req.file.path,
      expiryTime,
      senderEmail: req.body.senderEmail?.trim() || '',
      receiverEmail: req.body.receiverEmail?.trim() || '',
    });

    const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const infoPage = `${base}/api/files/${doc.uuid}/info`;
    const viewLink = `${base}/api/files/${doc.uuid}/view`;
    const downloadLink = `${base}/api/files/${doc.uuid}/download`;

    //  Confirmation email to sender
    if (doc.senderEmail) {
      try {
        await sendFileToSender({
          to: doc.senderEmail,
          link: viewLink, 
          originalName: doc.originalName,
          expiryHours,
        });
      } catch (e) {
        console.error(" Failed to send confirmation email:", e.message);
      }
    }

    // 📥 Download link email to receiver
    if (doc.receiverEmail) {
      try {
        await sendDownloadLink({
          to: doc.receiverEmail,
          link: viewLink, 
          originalName: doc.originalName,
          expiryHours,
        });
      } catch (e) {
        console.error(" Failed to send download link:", e.message);
      }
    }

    res.json({
      uuid: doc.uuid,
      originalName: doc.originalName,
      expiresAt: doc.expiryTime,
      links: { info: infoPage, view: viewLink, download: downloadLink },
      message: ' File uploaded successfully!',
    });
  } catch (err) {
    console.error(" Upload error:", err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

/** GET /api/files/:uuid/info -> file metadata */
router.get('/:uuid/info', async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });
  if (!file) return res.status(404).json({ message: 'Not found' });

  const expired = new Date() > file.expiryTime;
  res.json({
    uuid: file.uuid,
    originalName: file.originalName,
    sizeBytes: file.sizeBytes,
    mimeType: file.mimeType,
    expiresAt: file.expiryTime,
    expired,
    downloadCount: file.downloadCount,
  });
});

/** GET /api/files/:uuid/view -> open in browser */
router.get('/:uuid/view', async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });
  if (!file) return res.status(404).json({ message: 'Not found' });

  if (new Date() > file.expiryTime) {
    try { if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath); } catch {}
    await file.deleteOne();
    return res.status(410).json({ message: 'Link expired' });
  }

  file.downloadCount += 1;
  await file.save();

  //  Make sure browser tries to render
  res.setHeader("Content-Type", file.mimeType);
  res.setHeader("Content-Disposition", `inline; filename="${file.originalName}"`);
  res.sendFile(path.resolve(file.filePath));
});

/** GET /api/files/:uuid/download -> force download */
router.get('/:uuid/download', async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });
  if (!file) return res.status(404).json({ message: 'Not found' });

  if (new Date() > file.expiryTime) {
    try { if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath); } catch {}
    await file.deleteOne();
    return res.status(410).json({ message: 'Link expired' });
  }

  file.downloadCount += 1;
  await file.save();
  res.download(file.filePath, file.originalName);
});

/** GET /api/files/user/:email -> list user uploads */
//files which are uploaded
router.get('/my-files/:email', async (req, res) => {
  try {
    const files = await File.find({ senderEmail: req.params.email, isDeleted: false })
      .sort({ createdAt: -1 });
    res.json(files);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


//recently deleted
router.get('/deleted/:email', async (req, res) => {
  try {
    const files = await File.find({ senderEmail: req.params.email, isDeleted: true })
      .sort({ deletedAt: -1 });
    res.json(files);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});


//files moved to recently deleted
router.delete('/soft-delete/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) return res.status(404).json({ message: 'File not found' });

    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    res.json({ message: 'File moved to Recently Deleted', file });
  } catch {
    res.status(500).json({ message: 'Server error deleting file' });
  }
});


//to restore files
router.patch('/restore/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid, isDeleted: true });
    if (!file) return res.status(404).json({ message: 'File not found or not deleted' });

    file.isDeleted = false;
    file.deletedAt = null;
    await file.save();

    res.json({ message: 'File restored successfully', file });
  } catch {
    res.status(500).json({ message: 'Server error restoring file' });
  }
});


//to permanentely delete the file
router.delete('/permanent/:uuid', async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid, isDeleted: true });
    if (!file) return res.status(404).json({ message: 'File not found or not deleted' });

    if (fs.existsSync(file.filePath)) {
      try { fs.unlinkSync(file.filePath); } catch (e) { console.error("Disk delete:", e.message); }
    }
    await file.deleteOne();
    res.json({ message: 'File permanently deleted' });
  } catch {
    res.status(500).json({ message: 'Server error permanently deleting file' });
  }
});

module.exports = router;

