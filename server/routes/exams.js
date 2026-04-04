const express = require('express');
const router  = express.Router();
const Exam    = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// GET /api/exams
router.get('/', protect, async (req, res) => {
  try {
    const { semester, type, courseId, upcoming } = req.query;
    const query = {};

    if (semester) query.semester = parseInt(semester, 10);
    if (type)     query.type     = type;
    if (courseId) query.course   = courseId;
    if (upcoming === 'true') query.date = { $gte: new Date() };

    const exams = await Exam.find(query)
      .populate('course', 'name code')
      .sort({ date: 1 });

    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/exams/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'name code');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/exams
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { name, course, date, totalMarks, passingMarks } = req.body;
    if (!name || !course || !date || !totalMarks || !passingMarks) {
      return res.status(400).json({
        success: false,
        message: 'name, course, date, totalMarks and passingMarks are required',
      });
    }
    if (passingMarks > totalMarks) {
      return res.status(400).json({
        success: false,
        message: 'passingMarks cannot exceed totalMarks',
      });
    }
    const exam = await Exam.create(req.body);
    const populated = await Exam.findById(exam._id).populate('course', 'name code');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/exams/:id
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    if (
      req.body.passingMarks &&
      req.body.totalMarks &&
      req.body.passingMarks > req.body.totalMarks
    ) {
      return res.status(400).json({
        success: false,
        message: 'passingMarks cannot exceed totalMarks',
      });
    }
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('course', 'name code');
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/exams/:id (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });
    res.json({ success: true, message: 'Exam deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
