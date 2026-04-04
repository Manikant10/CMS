const express = require('express');
const router  = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

// POST /api/attendance — Mark bulk attendance
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { attendance } = req.body;

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ success: false, message: 'attendance array is required' });
    }

    const results = [];
    for (const record of attendance) {
      if (!record.studentId || !record.courseId || !record.date) continue;

      const entry = await Attendance.findOneAndUpdate(
        {
          student: record.studentId,
          course:  record.courseId,
          date:    new Date(record.date),
        },
        {
          status:   record.status || 'present',
          markedBy: req.user.profileId,
        },
        { upsert: true, new: true }
      );
      results.push(entry);
    }

    if (req.io && results.length > 0) {
      req.io.emit('attendance-marked', {
        courseId:  attendance[0].courseId,
        date:      attendance[0].date,
        count:     results.length,
        facultyId: req.user.profileId,
      });
    }

    res.json({
      success: true,
      data:    results,
      message: `Attendance marked for ${results.length} student(s)`,
    });
  } catch (error) {
    console.error('POST /attendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/report — Filtered attendance report (admin & faculty)
router.get('/report', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { courseId, studentId, startDate, endDate } = req.query;
    const query = {};

    if (courseId)  query.course  = courseId;
    if (studentId) query.student = studentId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate)   query.date.$lte = new Date(endDate);
    }

    // Faculty can only view their own courses' attendance
    if (req.user.role === 'faculty') {
      query.markedBy = req.user.profileId;
    }

    const records = await Attendance.find(query)
      .populate('student', 'name rollNo semester section')
      .populate('course',  'name code')
      .sort({ date: -1 })
      .limit(1000);

    // Aggregate summary per student
    const summaryMap = {};
    records.forEach(r => {
      const key = r.student?._id?.toString();
      if (!key) return;
      if (!summaryMap[key]) {
        summaryMap[key] = { student: r.student, total: 0, present: 0, absent: 0, late: 0 };
      }
      summaryMap[key].total++;
      summaryMap[key][r.status] = (summaryMap[key][r.status] || 0) + 1;
    });

    const summary = Object.values(summaryMap).map(s => ({
      ...s,
      percentage: s.total > 0
        ? (((s.present + s.late) / s.total) * 100).toFixed(1)
        : '0.0',
    }));

    res.json({ success: true, data: records, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    // Students can only view their own attendance
    if (
      req.user.role === 'student' &&
      req.user.profileId?.toString() !== req.params.studentId
    ) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const records = await Attendance.find({ student: req.params.studentId })
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Group by course
    const byCourse = {};
    records.forEach(r => {
      const key = r.course?._id?.toString();
      if (!key) return;
      if (!byCourse[key]) {
        byCourse[key] = { course: r.course, total: 0, present: 0, absent: 0, late: 0 };
      }
      byCourse[key].total++;
      byCourse[key][r.status] = (byCourse[key][r.status] || 0) + 1;
    });

    const courseSummary = Object.values(byCourse).map(c => ({
      ...c,
      percentage: c.total > 0
        ? (((c.present + c.late) / c.total) * 100).toFixed(1)
        : '0.0',
    }));

    res.json({ success: true, data: records, courseSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
