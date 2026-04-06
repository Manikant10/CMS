const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// PUT /api/admin/profile — Update admin profile and optional password
router.put('/profile', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check email uniqueness (skip own record)
    const conflict = await User.findOne({ email: normalizedEmail, _id: { $ne: req.user._id } });
    if (conflict) {
      return res.status(400).json({ success: false, message: 'Email already in use by another account' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }

    user.email = normalizedEmail;
    if (typeof name === 'string') {
      user.name = name.trim();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      user.password = newPassword;
    }

    await user.save();

    return res.json({
      success: true,
      message: newPassword ? 'Profile and password updated successfully' : 'Profile updated successfully',
      data: {
        email: user.email,
        name: user.name || 'Admin',
      },
    });
  } catch (error) {
    console.error('Admin profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users — List all users (admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/toggle — Activate / deactivate a user
router.put('/users/:id/toggle', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { id: user._id, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
