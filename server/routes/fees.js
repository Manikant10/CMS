const express = require('express');
const router = express.Router();
const Fee     = require('../models/Fee');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// GET /api/fees — All fee records (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [fees, total] = await Promise.all([
      Fee.find(query)
        .populate('student', 'name rollNo semester')
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Fee.countDocuments(query),
    ]);

    res.json({ success: true, data: fees, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/fees/student/:studentId — Fee records for a specific student
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;

    // Students can only view their own fees
    if (req.user.role === 'student' && req.user.profileId?.toString() !== studentId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const fees = await Fee.find({ student: studentId })
      .populate('student', 'name rollNo semester')
      .sort({ semester: 1 });

    res.json({ success: true, data: fees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/fees — Create fee record (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { student, semester, totalAmount, dueDate, feeType } = req.body;

    if (!student || !semester || !totalAmount || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'student, semester, totalAmount and dueDate are required',
      });
    }

    const studentDoc = await Student.findById(student);
    if (!studentDoc) return res.status(404).json({ success: false, message: 'Student not found' });

    // Check for existing record for same student+semester+type
    const existing = await Fee.findOne({ student, semester, feeType: feeType || 'Tuition' });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Fee record already exists for this student/semester/type',
      });
    }

    const fee = await Fee.create({ student, semester, totalAmount, dueDate, feeType });
    const populated = await Fee.findById(fee._id).populate('student', 'name rollNo');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/fees/:id/payment — Record a payment transaction (admin only)
router.put('/:id/payment', protect, authorize('admin'), async (req, res) => {
  try {
    const { amount, method, receiptNo, remarks } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'A valid payment amount is required' });
    }

    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

    fee.transactions.push({ amount, method: method || 'Cash', receiptNo, remarks });
    fee.paidAmount += amount;

    // Auto-update status
    if (fee.paidAmount >= fee.totalAmount) {
      fee.status = 'Paid';
    } else if (fee.paidAmount > 0) {
      fee.status = 'Partial';
    }

    await fee.save();

    const populated = await Fee.findById(fee._id).populate('student', 'name rollNo');

    // Emit real-time update
    if (req.io) {
      req.io.emit('fee-updated', { studentId: fee.student, feeData: populated });
    }

    res.json({ success: true, data: populated, message: 'Payment recorded successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/fees/:id (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
    res.json({ success: true, message: 'Fee record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
