const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['General', 'Academic', 'Exam', 'Event', 'Placement', 'Sports', 'Other'],
    default: 'General',
  },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetAudience: {
    type: String,
    enum: ['All', 'Students', 'Faculty'],
    default: 'All',
  },
  attachments: [{ type: String }],
  isPinned: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Notice', noticeSchema);
