require('dotenv').config();
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const File = require('../models/file');

(async () => {
  await connectDB(process.env.MONGO_URI);

  const now = new Date();
  const expired = await File.find({ expiryTime: { $lte: now } });

  for (const file of expired) {
    try {
      if (fs.existsSync(file.filePath)) fs.unlinkSync(file.filePath);
    } catch (e) {
      console.warn('Could not delete file:', file.filePath, e.message);
    }
  }

  await File.deleteMany({ expiryTime: { $lte: now } });
  console.log(`🧹 Cleanup complete: removed ${expired.length} expired file(s)`);
  await mongoose.disconnect();
})();
