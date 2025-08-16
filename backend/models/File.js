const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  uuid: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  mimeType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  filePath: { type: String, required: true },

  uploadTime: { type: Date, default: Date.now },
  expiryTime: { type: Date, required: true },

  senderEmail: { type: String },
  receiverEmail: { type: String },

  downloadCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
