const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  type: { type: String, enum: ['Internal', 'External', 'Assignment', 'Quiz'], default: 'Internal' },
  semester: { type: Number, min: 1, max: 8 },
  description: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
