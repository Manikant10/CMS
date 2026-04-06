const express = require('express');
const router = express.Router();
const Student   = require('../models/Student');
const Faculty   = require('../models/Faculty');
const Course    = require('../models/Course');
const Fee       = require('../models/Fee');
const Notice    = require('../models/Notice');
const User      = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/dashboard/stats  — Admin only (aggregated numbers)
router.get('/stats', protect, async (req, res) => {
  try {
    const [totalStudents, totalFaculty, totalCourses, pendingRegistrations, feeAgg] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Faculty.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false, role: { $in: ['student', 'faculty'] } }),
      Fee.aggregate([
        { $group: {
            _id: null,
            totalFeeCollected: { $sum: '$paidAmount' },
            totalFeeDue:       { $sum: '$remainingAmount' },
        }},
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalCourses,
        pendingRegistrations,
        totalFeeCollected: feeAgg[0]?.totalFeeCollected || 0,
        totalFeeDue:       feeAgg[0]?.totalFeeDue       || 0,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard stats' });
  }
});

// GET /api/dashboard/overview  — Role-specific overview data
router.get('/overview', protect, async (req, res) => {
  try {
    const role = req.user.role;
    let overview = {};

    if (role === 'admin') {
      const [totalStudents, totalFaculty, totalCourses, totalNotices, feeAgg, studentsBySem] =
        await Promise.all([
          Student.countDocuments({ isActive: true }),
          Faculty.countDocuments({ isActive: true }),
          Course.countDocuments({ isActive: true }),
          Notice.countDocuments({ isActive: true }),
          Fee.aggregate([
            { $group: {
                _id: null,
                totalFeeCollected: { $sum: '$paidAmount' },
                totalFeeDue:       { $sum: '$remainingAmount' },
            }},
          ]),
          Student.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$semester', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
        ]);

      const recentPayments = await Fee.find({})
        .sort({ lastUpdated: -1 })
        .limit(5)
        .select('studentName paidAmount lastUpdated');

      overview = {
        totalStudents,
        totalFaculty,
        totalCourses,
        totalNotices,
        totalFeeCollected: feeAgg[0]?.totalFeeCollected || 0,
        totalFeeDue:       feeAgg[0]?.totalFeeDue       || 0,
        studentsBySemester: studentsBySem,
        recentPayments,
      };
    }

    if (role === 'faculty') {
      const courses = await Course.find({ faculty: req.user.profileId, isActive: true })
        .select('name code semester')
        .limit(10);

      overview = {
        assignedCourses: courses.length,
        courses,
      };
    }

    if (role === 'student') {
      const notices = await Notice.find({ isActive: true })
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5)
        .select('title category createdAt');

      overview = {
        announcements: notices,
      };
    }

    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: 'Failed to load overview' });
  }
});

module.exports = router;
