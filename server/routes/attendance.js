const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// POST /api/attendance - Mark attendance for multiple students
router.post('/', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const { attendance } = req.body; // attendance: [{ studentId, courseId, date, status, markedBy }]
    const results = [];

    for (const record of attendance) {
      const attendanceRecord = await Attendance.findOneAndUpdate(
        { student: record.studentId, course: record.courseId, date: new Date(record.date) },
        { status: record.status, markedBy: record.markedBy },
        { upsert: true, new: true }
      );
      results.push(attendanceRecord);
    }

    // Emit real-time update
    if (attendance.length > 0) {
      req.io.emit('attendance-marked', {
        courseId: attendance[0].courseId,
        date: attendance[0].date,
        attendance: results,
        facultyId: req.user.profileId
      });
    }

    res.json({ success: true, data: results, message: `Attendance marked for ${results.length} students` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/report - Get attendance report
router.get('/report', protect, async (req, res) => {
  try {
    const { courseId, studentId, startDate, endDate, semester, section } = req.query;
    const query = {};

    if (courseId) query.course = courseId;
    if (studentId) query.student = studentId;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate('student', 'name rollNo semester section')
      .populate('course', 'name code')
      .sort({ date: -1 });

    // Calculate summary
    const summary = {};
    records.forEach(r => {
      const key = r.student?._id?.toString();
      if (!key) return;
      if (!summary[key]) {
        summary[key] = { student: r.student, total: 0, present: 0, absent: 0, late: 0 };
      }
      summary[key].total++;
      summary[key][r.status]++;
    });

    const summaryArr = Object.values(summary).map(s => ({
      ...s,
      percentage: s.total > 0 ? ((s.present + s.late) / s.total * 100).toFixed(1) : 0,
    }));

    res.json({ success: true, data: records, summary: summaryArr });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attendance/student/:studentId
router.get('/student/:studentId', protect, async (req, res) => {
  try {
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
      byCourse[key][r.status]++;
    });

    const courseSummary = Object.values(byCourse).map(c => ({
      ...c,
      percentage: c.total > 0 ? ((c.present + c.late) / c.total * 100).toFixed(1) : 0,
    }));

    res.json({ success: true, data: records, courseSummary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
