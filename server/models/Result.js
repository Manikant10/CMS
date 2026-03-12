const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  marksObtained: { type: Number, required: true, min: 0 },
  grade: { type: String, trim: true },
  remarks: { type: String, trim: true },
}, { timestamps: true });

resultSchema.index({ student: 1, exam: 1 }, { unique: true });

// Auto-calculate grade
resultSchema.pre('save', async function (next) {
  const Exam = mongoose.model('Exam');
  const exam = await Exam.findById(this.exam);
  if (exam) {
    const pct = (this.marksObtained / exam.totalMarks) * 100;
    if (pct >= 90) this.grade = 'A+';
    else if (pct >= 80) this.grade = 'A';
    else if (pct >= 70) this.grade = 'B+';
    else if (pct >= 60) this.grade = 'B';
    else if (pct >= 50) this.grade = 'C';
    else if (pct >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  next();
});

module.exports = mongoose.model('Result', resultSchema);
