const mongoose = require('mongoose');
const TumbnailSchema = new mongoose.Schema({
  url: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});
model.exports = mongoose.model('Tumbnail', TumbnailSchema);