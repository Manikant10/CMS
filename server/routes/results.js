const express = require('express');
const router = express.Router();
const Result = require('../models/Result');
const { protect, authorize } = require('../middleware/auth');

// GET /api/results
router.get('/', protect, async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    const query = {};
    if (examId) query.exam = examId;
    if (studentId) query.student = studentId;
    const results = await Result.find(query)
      .populate('student', 'name rollNo semester')
      .populate({ path: 'exam', populate: { path: 'course', select: 'name code' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/results/bulk - Upload marks for multiple students
router.post('/bulk', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { examId, results: marksData } = req.body; // [{ studentId, marksObtained }]
    const saved = [];
    for (const m of marksData) {
      const result = await Result.findOneAndUpdate(
        { student: m.studentId, exam: examId },
        { marksObtained: m.marksObtained, remarks: m.remarks },
        { upsert: true, new: true }
      );
      // Trigger grade calculation
      const r = await Result.findById(result._id);
      await r.save();
      saved.push(r);
    }
    res.json({ success: true, data: saved, message: `Results saved for ${saved.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/results/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId })
      .populate({ path: 'exam', populate: { path: 'course', select: 'name code credits' } })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/results
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const result = new Result(req.body);
    await result.save();
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/results/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Result deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
