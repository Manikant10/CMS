const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Fee = require('../models/Fee');
const Notice = require('../models/Notice');
const Exam = require('../models/Exam');
const LibraryBook = require('../models/LibraryBook');
const BookIssue = require('../models/BookIssue');
const { protect } = require('../middleware/auth');

// Helper function to get data (MongoDB or Mock)
const getData = async () => {
  try {
    // Try MongoDB first
    const [students, faculty, courses, fees] = await Promise.all([
      Student.find({}),
      Faculty.find({}),
      Course.find({}),
      Fee.find({})
    ]);
    
    return {
      students,
      faculty,
      courses,
      fees,
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalCourses: courses.length,
      totalFeeCollected: fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0),
      totalFeeDue: fees.reduce((sum, fee) => sum + (fee.remainingAmount || 0), 0),
    };
  } catch (error) {
    // Fallback to mock data
    console.log('Using mock data fallback...');
    return global.mockDB || {};
  }
};

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const data = await getData();
    
    const stats = {
      totalStudents: data.totalStudents || 0,
      totalFaculty: data.totalFaculty || 0,
      totalCourses: data.totalCourses || 0,
      totalFeeCollected: data.totalFeeCollected || 0,
      totalFeeDue: data.totalFeeDue || 0,
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

      if (req.user.role === 'admin') {
        stats.totalStudents = mockData.students.length;
        stats.totalFaculty = mockData.faculty.length;
        stats.totalCourses = 5; // Mock data
        stats.totalFeeCollected = 150000; // Mock data
        stats.totalFeeDue = 50000; // Mock data
        stats.totalNotices = mockData.notices.length;
        stats.totalBooks = 1000; // Mock data
        stats.pendingBookIssues = 25; // Mock data

        // Semester-wise student count
        stats.studentsBySemester = [
          { _id: 1, count: 30 },
          { _id: 2, count: 28 },
          { _id: 3, count: 25 },
        ];

        // Recent fee payments (mock)
        stats.recentPayments = [];
      }

      if (req.user.role === 'faculty') {
        const facultyProfile = mockData.faculty.find(f => f._id === req.user.profileId);
        stats.assignedCourses = 3; // Mock data
        stats.courses = [
          { _id: '1', name: 'Computer Science', code: 'CS101' },
          { _id: '2', name: 'Data Structures', code: 'CS201' },
        ]; // Mock data

        // Today's classes from timetable (mock)
        stats.todayClasses = [
          {
            _id: '1',
            day: 'Monday',
            periods: [
              { course: { name: 'Computer Science' }, faculty: { name: facultyProfile?.name } }
            ]
          }
        ];
      }

      if (req.user.role === 'student') {
        const studentProfile = mockData.students.find(s => s._id === req.user.profileId);
        if (studentProfile) {
          // Attendance percentage (mock)
          stats.attendancePercentage = 85.5;

          // Fee dues (mock)
          stats.totalFeeDue = 25000;

          // Issued books (mock)
          stats.issuedBooks = 3;

          // Upcoming exams (mock)
          stats.upcomingExams = [
            {
              _id: '1',
              course: { name: 'Computer Science', code: 'CS101' },
              date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
            },
            {
              _id: '2',
              course: { name: 'Mathematics', code: 'MATH101' },
              date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // Next week
            }
          ];
        }
      }

      // Recent notices for all roles
      stats.recentNotices = mockData.notices.slice(0, 5).map(n => ({
        title: n.title,
        category: n.category,
        createdAt: n.createdAt
      }));

      return res.json({ success: true, data: stats });
    }

    // Original MongoDB logic
    if (req.user.role === 'admin') {
      const [students, faculty, courses, fees, notices, books, pendingIssues] = await Promise.all([
        Student.countDocuments({ isActive: true }),
        Faculty.countDocuments({ isActive: true }),
        Course.countDocuments({ isActive: true }),
        Fee.aggregate([
          { $group: { _id: null, totalCollected: { $sum: '$paidAmount' }, totalDue: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } } } },
        ]),
        Notice.countDocuments({ isActive: true }),
        LibraryBook.countDocuments(),
        BookIssue.countDocuments({ status: 'Issued' }),
      ]);

      stats.totalStudents = students;
      stats.totalFaculty = faculty;
      stats.totalCourses = courses;
      stats.totalFeeCollected = fees[0]?.totalCollected || 0;
      stats.totalFeeDue = fees[0]?.totalDue || 0;
      stats.totalNotices = notices;
      stats.totalBooks = books;
      stats.pendingBookIssues = pendingIssues;

      // Semester-wise student count
      stats.studentsBySemester = await Student.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$semester', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]);

      // Recent fee payments
      stats.recentPayments = await Fee.find({ paidAmount: { $gt: 0 } })
        .populate('student', 'name rollNo')
        .sort({ updatedAt: -1 })
        .limit(5);
    }

    if (req.user.role === 'faculty') {
      const Faculty = require('../models/Faculty');
      const facultyProfile = await Faculty.findById(req.user.profileId);
      const assignedCourses = await Course.find({ faculty: req.user.profileId, isActive: true });
      stats.assignedCourses = assignedCourses.length;
      stats.courses = assignedCourses;

      // Today's classes from timetable
      const today = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
      const Timetable = require('../models/Timetable');
      const todaySchedule = await Timetable.find({ day: today, 'periods.faculty': req.user.profileId })
        .populate('periods.course', 'name code')
        .populate('periods.faculty', 'name');
      stats.todayClasses = todaySchedule;
    }

    if (req.user.role === 'student') {
      const studentProfile = await Student.findById(req.user.profileId);
      if (studentProfile) {
        // Attendance percentage
        const totalAttendance = await Attendance.countDocuments({ student: req.user.profileId });
        const presentCount = await Attendance.countDocuments({ student: req.user.profileId, status: { $in: ['present', 'late'] } });
        stats.attendancePercentage = totalAttendance > 0 ? ((presentCount / totalAttendance) * 100).toFixed(1) : 0;

        // Fee dues
        const fees = await Fee.find({ student: req.user.profileId });
        stats.totalFeeDue = fees.reduce((sum, f) => sum + (f.totalAmount - f.paidAmount), 0);

        // Issued books
        stats.issuedBooks = await BookIssue.countDocuments({ student: req.user.profileId, status: 'Issued' });

        // Upcoming exams
        stats.upcomingExams = await Exam.find({ date: { $gte: new Date() }, semester: studentProfile.semester })
          .populate('course', 'name code')
          .sort({ date: 1 })
          .limit(5);
      }
    }

    // Recent notices for all roles
    stats.recentNotices = await Notice.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/dashboard/overview
router.get('/overview', protect, async (req, res) => {
  try {
    // TO DO: Implement overview logic
    res.json({ success: true, data: {} });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
