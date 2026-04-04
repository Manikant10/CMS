const express = require('express');
const router = express.Router();
const User    = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/auth');

// GET /api/approvals/pending — Users awaiting activation (admin only)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const pending = await User.find({ isActive: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/approve/:id — Activate a pending user (admin only)
router.post('/approve/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'User is already active' });
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} approved successfully`,
      data: { id: user._id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/reject/:id — Delete a pending user and their profile (admin only)
router.post('/reject/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot reject an already active user' });
    }

    // Remove linked profile
    if (user.role === 'student' && user.profileId) {
      await Student.findByIdAndDelete(user.profileId);
    } else if (user.role === 'faculty' && user.profileId) {
      await Faculty.findByIdAndDelete(user.profileId);
    }

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'Registration rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
