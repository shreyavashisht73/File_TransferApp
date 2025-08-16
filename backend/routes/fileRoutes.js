const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const File = require('../models/file');
const { sendDownloadLink } = require('../utils/mailer');

const router = express.Router();

/** Multer storage & filters */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1 GB
  fileFilter: (req, file, cb) => {
    // Allow most common types; extend as needed
    cb(null, true);
  }
});

/** POST /api/files/upload */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const expiryHours = Number(process.env.LINK_EXPIRY_HOURS || 24);
    const expiryTime = moment().add(expiryHours, 'hours').toDate();
    const id = uuidv4();

    const doc = await File.create({
      uuid: id,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
      filePath: req.file.path,
      expiryTime,
      senderEmail: req.body.senderEmail || '',
      receiverEmail: req.body.receiverEmail || ''
    });

    const base = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const downloadPage = `${base}/api/files/${doc.uuid}/info`;   // metadata endpoint
    const directDownload = `${base}/api/files/${doc.uuid}/download`;

    // Optional email
    if (doc.receiverEmail) {
      await sendDownloadLink({
        to: doc.receiverEmail,
        link: directDownload,
        originalName: doc.originalName,
        expiryHours
      });
    }

    res.json({
      uuid: doc.uuid,
      originalName: doc.originalName,
      expiresAt: doc.expiryTime,
      links: {
        info: downloadPage,
        download: directDownload
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

/** GET /api/files/:uuid/info -> metadata (for frontend countdown) */
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
    downloadCount: file.downloadCount
  });
});

/** GET /api/files/:uuid/download -> triggers actual download */
router.get('/:uuid/download', async (req, res) => {
  const file = await File.findOne({ uuid: req.params.uuid });
  if (!file) return res.status(404).json({ message: 'Not found' });

  if (new Date() > file.expiryTime) {
    // On expiry, tidy up
    try { if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath); } catch {}
    await file.deleteOne();
    return res.status(410).json({ message: 'Link expired' });
  }

  file.downloadCount += 1;
  await file.save();
  res.download(file.filePath, file.originalName);
});

module.exports = router;
