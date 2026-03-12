const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  room: { type: String, trim: true },
  type: { type: String, enum: ['Lecture', 'Lab', 'Tutorial', 'Break'], default: 'Lecture' },
});

const timetableSchema = new mongoose.Schema({
  semester: { type: Number, required: true, min: 1, max: 8 },
  section: { type: String, default: 'A', trim: true },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  periods: [periodSchema],
}, { timestamps: true });

timetableSchema.index({ semester: 1, section: 1, day: 1 }, { unique: true });

module.exports = mongoose.model('Timetable', timetableSchema);
