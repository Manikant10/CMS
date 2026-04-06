const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students — All students (admin & faculty only)
router.get('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { semester, section, batch, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (semester) query.semester = parseInt(semester, 10);
    if (section)  query.section  = section;
    if (batch)    query.batch    = batch;
    if (search) {
      query.$or = [
        { name:   { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email:  { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [students, total] = await Promise.all([
      Student.find(query)
        .sort({ rollNo: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: students,
      total,
      page:  pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('GET /students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    // Students can only view their own profile
    if (req.user.role === 'student' && req.user.profileId?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students — Create student + linked user account
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, email, ...studentData } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    // Check for duplicate email or rollNo
    const duplicate = await Student.findOne({
      $or: [{ email: email?.toLowerCase() }, { rollNo: studentData.rollNo }],
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A student with this roll number or email already exists',
      });
    }

    // Create profile first
    const student = await Student.create({
      ...studentData,
      email: email?.toLowerCase(),
      isActive: true,
    });
    try {
      // Create user account (active immediately when admin creates it)
      const user = await User.create({
        email:     email?.toLowerCase(),
        password,
        role:      'student',
        profileId: student._id,
        isActive:  true,
      });

      // Keep backward-compatible linkage for delete/update flows.
      student.userId = user._id;
      await student.save();
    } catch (error) {
      await Student.findByIdAndDelete(student._id);
      throw error;
    }

    res.status(201).json({ success: true, data: student });
  } catch (error) {
    console.error('POST /students error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/:id
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    // Remove fields that must not be updated this way
    const { password, email, ...updateData } = req.body;

    const student = await Student.findByIdAndUpdate(req.params.id, updateData, {
      new:            true,
      runValidators:  true,
    });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id — soft delete
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const userFilters = [{ profileId: student._id }];
    if (student.userId) userFilters.push({ _id: student.userId });
    if (student.email) userFilters.push({ email: student.email.toLowerCase() });

    // Deactivate any linked user account for this student record.
    await User.updateMany(
      { role: 'student', $or: userFilters },
      { $set: { isActive: false } }
    );

    res.json({ success: true, message: 'Student deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
