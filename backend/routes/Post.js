const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['blog', 'news', 'initiative'], required: true },
  image: { type: String }, // stores filename or URL
  createdAt: { type: Date, default: Date.now },
  isBuyerVisible: { type: Boolean, default: false } // NEW: for buyer dashboard
});

module.exports = mongoose.model('Post', PostSchema);