const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

// GET /api/courses
router.get('/', protect, async (req, res) => {
  try {
    const { semester, type, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (semester) query.semester = parseInt(semester, 10);
    if (type)     query.type     = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [courses, total] = await Promise.all([
      Course.find(query)
        .populate('faculty', 'name empId email')
        .sort({ semester: 1, code: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Course.countDocuments(query),
    ]);

    res.json({ success: true, data: courses, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('faculty', 'name empId email');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const duplicate = await Course.findOne({ code: req.body.code });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A course with this code already exists' });
    }

    const course = await Course.create({ ...req.body, isActive: true });
    const populated = await Course.findById(course._id).populate('faculty', 'name empId');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/courses/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate('faculty', 'name empId');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/courses/:id — soft delete
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
