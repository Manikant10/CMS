const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  credits: { type: Number, required: true, min: 1 },
  semester: { type: Number, required: true, min: 1, max: 8 },
  type: { type: String, enum: ['Theory', 'Lab', 'Elective'], default: 'Theory' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  room: { type: String, trim: true },
  description: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
