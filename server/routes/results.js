const express = require('express');
const router  = express.Router();
const Result  = require('../models/Result');
const Exam    = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// GET /api/results
router.get('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    const query = {};
    if (examId)    query.exam    = examId;
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

// GET /api/results/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Students can only access their own results
    if (
      req.user.role === 'student' &&
      req.user.profileId?.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const results = await Result.find({ student: req.params.studentId })
      .populate({ path: 'exam', populate: { path: 'course', select: 'name code credits' } })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/results — Single result entry
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { student, exam, marksObtained } = req.body;
    if (!student || !exam || marksObtained == null) {
      return res.status(400).json({ success: false, message: 'student, exam and marksObtained are required' });
    }

    const examDoc = await Exam.findById(exam);
    if (!examDoc) return res.status(404).json({ success: false, message: 'Exam not found' });

    if (marksObtained < 0 || marksObtained > examDoc.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `marksObtained must be between 0 and ${examDoc.totalMarks}`,
      });
    }

    const result = new Result(req.body);
    await result.save(); // triggers pre-save grade calculation
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Result already exists for this student/exam' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/results/bulk — Bulk marks entry
router.post('/bulk', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { examId, results: marksData } = req.body;

    if (!examId || !Array.isArray(marksData) || marksData.length === 0) {
      return res.status(400).json({ success: false, message: 'examId and results[] are required' });
    }

    const examDoc = await Exam.findById(examId);
    if (!examDoc) return res.status(404).json({ success: false, message: 'Exam not found' });

    const saved = [];
    const errors = [];

    for (const m of marksData) {
      if (!m.studentId) { errors.push('Missing studentId'); continue; }
      if (m.marksObtained < 0 || m.marksObtained > examDoc.totalMarks) {
        errors.push(`Invalid marks for student ${m.studentId}`);
        continue;
      }
      const result = await Result.findOneAndUpdate(
        { student: m.studentId, exam: examId },
        { marksObtained: m.marksObtained, remarks: m.remarks },
        { upsert: true, new: true }
      );
      // Re-save to trigger grade pre-hook
      await result.save();
      saved.push(result);
    }

    res.json({
      success: true,
      data:    saved,
      errors:  errors.length ? errors : undefined,
      message: `Results saved for ${saved.length} student(s)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/results/:id (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
    res.json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
