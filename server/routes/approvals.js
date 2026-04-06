const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/auth');

// GET /api/approvals/pending - Users awaiting activation (admin only)
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    const pendingUsers = await User.find({
      isActive: false,
      role: { $in: ['student', 'faculty'] },
    })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const studentProfileIds = pendingUsers
      .filter((u) => u.role === 'student' && u.profileId)
      .map((u) => u.profileId);
    const facultyProfileIds = pendingUsers
      .filter((u) => u.role === 'faculty' && u.profileId)
      .map((u) => u.profileId);

    const studentEmails = pendingUsers
      .filter((u) => u.role === 'student' && u.email)
      .map((u) => u.email.toLowerCase());
    const facultyEmails = pendingUsers
      .filter((u) => u.role === 'faculty' && u.email)
      .map((u) => u.email.toLowerCase());

    const [studentProfiles, facultyProfiles] = await Promise.all([
      Student.find({
        $or: [
          { _id: { $in: studentProfileIds } },
          { email: { $in: studentEmails } },
        ],
      })
        .select('name email rollNo semester section batch phone')
        .lean(),
      Faculty.find({
        $or: [
          { _id: { $in: facultyProfileIds } },
          { email: { $in: facultyEmails } },
        ],
      })
        .select('name email empId phone department')
        .lean(),
    ]);

    const studentById = new Map(studentProfiles.map((p) => [String(p._id), p]));
    const studentByEmail = new Map(studentProfiles.map((p) => [String(p.email).toLowerCase(), p]));
    const facultyById = new Map(facultyProfiles.map((p) => [String(p._id), p]));
    const facultyByEmail = new Map(facultyProfiles.map((p) => [String(p.email).toLowerCase(), p]));

    const pending = pendingUsers.map((user) => {
      const profile = user.role === 'student'
        ? (studentById.get(String(user.profileId || '')) || studentByEmail.get(String(user.email || '').toLowerCase()))
        : (facultyById.get(String(user.profileId || '')) || facultyByEmail.get(String(user.email || '').toLowerCase()));

      return {
        ...user,
        name: profile?.name || user.name,
        phone: profile?.phone || '',
        rollNo: profile?.rollNo || '',
        semester: profile?.semester || '',
        section: profile?.section || '',
        batch: profile?.batch || '',
        empId: profile?.empId || '',
        department: profile?.department || '',
      };
    });

    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/approve/:id - Activate a pending user (admin only)
router.post('/approve/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'User is already active' });
    }

    let linkedProfile = null;

    if (user.role === 'student') {
      if (user.profileId) {
        linkedProfile = await Student.findByIdAndUpdate(user.profileId, { isActive: true }, { new: true });
      }
      if (!linkedProfile) {
        linkedProfile = await Student.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          { isActive: true },
          { new: true }
        );
      }
    } else if (user.role === 'faculty') {
      if (user.profileId) {
        linkedProfile = await Faculty.findByIdAndUpdate(user.profileId, { isActive: true }, { new: true });
      }
      if (!linkedProfile) {
        linkedProfile = await Faculty.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          { isActive: true },
          { new: true }
        );
      }
    }

    if (linkedProfile && !user.profileId) {
      user.profileId = linkedProfile._id;
    }

    user.isActive = true;
    await user.save();

    res.json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} approved successfully`,
      data: { id: user._id, email: user.email, role: user.role, profileId: user.profileId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/reject/:id - Delete a pending user and their profile (admin only)
router.post('/reject/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isActive) {
      return res.status(400).json({ success: false, message: 'Cannot reject an already active user' });
    }

    // Remove linked profile (by profileId first, by email fallback)
    if (user.role === 'student') {
      if (user.profileId) await Student.findByIdAndDelete(user.profileId);
      await Student.findOneAndDelete({ email: user.email.toLowerCase() });
    } else if (user.role === 'faculty') {
      if (user.profileId) await Faculty.findByIdAndDelete(user.profileId);
      await Faculty.findOneAndDelete({ email: user.email.toLowerCase() });
    }

    await User.findByIdAndDelete(user._id);

    res.json({ success: true, message: 'Registration rejected and removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;