const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const COURSE_TYPES = new Set(['Theory', 'Lab', 'Elective']);

const normalizeCoursePayload = (body = {}) => {
  const payload = { ...body };

  if (typeof payload.code === 'string') payload.code = payload.code.trim().toUpperCase();
  if (typeof payload.name === 'string') payload.name = payload.name.trim();
  if (typeof payload.room === 'string') payload.room = payload.room.trim();
  if (typeof payload.description === 'string') payload.description = payload.description.trim();
  if (payload.semester !== undefined) payload.semester = Number(payload.semester);
  if (payload.credits !== undefined) payload.credits = Number(payload.credits);

  if (typeof payload.type === 'string') {
    const normalizedType = payload.type.trim().toLowerCase();
    payload.type = normalizedType
      ? `${normalizedType.charAt(0).toUpperCase()}${normalizedType.slice(1)}`
      : '';
  }

  if (!payload.type) payload.type = 'Theory';
  if (!COURSE_TYPES.has(payload.type)) {
    payload.type = payload.type || '';
  }

  if (!payload.faculty) {
    delete payload.faculty;
  }

  return payload;
};

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
    const payload = normalizeCoursePayload(req.body);

    if (!payload.code || !payload.name || !payload.semester || !payload.credits) {
      return res.status(400).json({
        success: false,
        message: 'code, name, semester and credits are required',
      });
    }

    if (!COURSE_TYPES.has(payload.type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be one of: Theory, Lab, Elective',
      });
    }

    const duplicate = await Course.findOne({ code: payload.code });
    if (duplicate) {
      return res.status(400).json({ success: false, message: 'A course with this code already exists' });
    }

    const course = await Course.create({ ...payload, isActive: true });
    const populated = await Course.findById(course._id).populate('faculty', 'name empId');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create course' });
  }
});

// PUT /api/courses/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body);

    if (payload.code) {
      const duplicate = await Course.findOne({ code: payload.code, _id: { $ne: req.params.id } });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'A course with this code already exists' });
      }
    }

    if (payload.type && !COURSE_TYPES.has(payload.type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be one of: Theory, Lab, Elective',
      });
    }

    const course = await Course.findByIdAndUpdate(req.params.id, payload, {
      new: true, runValidators: true,
    }).populate('faculty', 'name empId');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update course' });
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
