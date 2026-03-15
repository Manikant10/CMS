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

// GET /api/dashboard/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const data = await getData();
    
    let overview = {};

    if (req.user.role === 'admin') {
      overview = {
        totalStudents: data.totalStudents || 0,
        totalFaculty: data.totalFaculty || 0,
        totalCourses: data.totalCourses || 0,
        totalFeeCollected: data.totalFeeCollected || 0,
        totalFeeDue: data.totalFeeDue || 0,
        totalNotices: data.notices?.length || 0,
        totalBooks: 1000, // Mock data
        pendingBookIssues: 25, // Mock data
        studentsBySemester: [
          { _id: 1, count: 30 },
          { _id: 2, count: 28 },
          { _id: 3, count: 25 },
        ],
        recentPayments: data.fees?.slice(0, 5).map(fee => ({
          studentName: fee.studentName,
          amount: fee.paidAmount,
          date: fee.lastUpdated,
          type: 'fee'
        })) || []
      };
    }

    if (req.user.role === 'faculty') {
      const facultyProfile = data.faculty?.find(f => f._id === req.user.profileId);
      overview = {
        assignedCourses: 3, // Mock data
        courses: data.courses?.slice(0, 3).map(course => ({
          _id: course._id,
          name: course.name,
          code: course.code
        })) || [],
        todayClasses: [
          {
            _id: '1',
            day: 'Monday',
            periods: [
              { course: { name: 'Computer Science' }, faculty: { name: facultyProfile?.name } }
            ]
          }
        ]
      };
    }

    if (req.user.role === 'student') {
      const studentProfile = data.students?.find(s => s._id === req.user.profileId);
      overview = {
        attendancePercentage: 85.5, // Mock data
        issuedBooks: 5, // Mock data
        upcomingExams: [
          { _id: '1', subject: 'Computer Science', date: '2024-03-15' },
          { _id: '2', subject: 'Mathematics', date: '2024-03-18' }
        ],
        announcements: [
          { _id: '1', title: 'Exam Schedule', type: 'exam', date: '2024-03-01' },
          { _id: '2', title: 'Fee Reminder', type: 'fee', date: '2024-02-28' }
        ]
      };
    }

    res.json({ success: true, data: overview });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
