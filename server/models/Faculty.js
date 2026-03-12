const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  empId: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  designation: { type: String, trim: true, default: 'Assistant Professor' },
  qualification: { type: String, trim: true },
  specialization: { type: String, trim: true },
  phone: { type: String, trim: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  joiningDate: { type: Date, default: Date.now },
  profilePic: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
