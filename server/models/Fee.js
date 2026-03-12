const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['Cash', 'Online', 'Cheque', 'DD'], default: 'Cash' },
  receiptNo: { type: String, trim: true },
  remarks: { type: String, trim: true },
});

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: Number, required: true, min: 1, max: 8 },
  totalAmount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  paidAmount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Overdue'],
    default: 'Pending',
  },
  transactions: [transactionSchema],
  feeType: { type: String, enum: ['Tuition', 'Hostel', 'Exam', 'Other'], default: 'Tuition' },
}, { timestamps: true });

feeSchema.index({ student: 1, semester: 1, feeType: 1 });

module.exports = mongoose.model('Fee', feeSchema);
