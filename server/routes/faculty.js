const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const User    = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/faculty
router.get('/', protect, async (req, res) => {
  try {
    const { search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [faculty, total] = await Promise.all([
      Faculty.find(query)
        .sort({ name: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Faculty.countDocuments(query),
    ]);

    res.json({ success: true, data: faculty, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/faculty/:id
router.get('/:id', protect, async (req, res) => {
  try {
    // Faculty can only view their own profile
    if (req.user.role === 'faculty' && req.user.profileId?.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/faculty — Create faculty + linked user account
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, email, empId, ...facultyData } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const duplicate = await Faculty.findOne({
      $or: [{ email: email?.toLowerCase() }, { empId }],
    });
    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A faculty member with this employee ID or email already exists',
      });
    }

    const faculty = await Faculty.create({
      ...facultyData,
      empId,
      email: email?.toLowerCase(),
      isActive: true,
    });
    try {
      const user = await User.create({
        email:     email?.toLowerCase(),
        password,
        role:      'faculty',
        profileId: faculty._id,
        isActive:  true,
      });

      // Keep backward-compatible linkage for delete/update flows.
      faculty.userId = user._id;
      await faculty.save();
    } catch (error) {
      await Faculty.findByIdAndDelete(faculty._id);
      throw error;
    }

    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    console.error('POST /faculty error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/faculty/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, email, ...updateData } = req.body; // strip immutable fields

    const faculty = await Faculty.findByIdAndUpdate(req.params.id, updateData, {
      new: true, runValidators: true,
    });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const deactivateFaculty = async (facultyId, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(facultyId, { isActive: false }, { new: true });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const userFilters = [{ profileId: faculty._id }];
    if (faculty.userId) userFilters.push({ _id: faculty.userId });
    if (faculty.email) userFilters.push({ email: faculty.email.toLowerCase() });

    await User.updateMany(
      { role: 'faculty', $or: userFilters },
      { $set: { isActive: false } }
    );

    res.json({ success: true, message: 'Faculty deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/faculty/:id — soft delete
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await deactivateFaculty(req.params.id, res);
});

// POST /api/faculty/:id/deactivate — soft delete fallback for clients/proxies that block DELETE
router.post('/:id/deactivate', protect, authorize('admin'), async (req, res) => {
  await deactivateFaculty(req.params.id, res);
});

module.exports = router;
