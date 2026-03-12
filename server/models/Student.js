const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, default: 'A', trim: true },
  batch: { type: String, required: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  dob: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  guardianName: { type: String, trim: true },
  guardianPhone: { type: String, trim: true },
  profilePic: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
