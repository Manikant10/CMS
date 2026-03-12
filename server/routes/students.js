const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// GET /api/students - Get all students
router.get('/', protect, async (req, res) => {
  try {
    const { semester, section, batch, search, page = 1, limit = 50 } = req.query;
    const query = { isActive: true };
    if (semester) query.semester = semester;
    if (section) query.section = section;
    if (batch) query.batch = batch;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(query)
      .sort({ rollNo: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Student.countDocuments(query);

    res.json({ success: true, data: students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/students/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, ...studentData } = req.body;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      
      // Check if student already exists
      const existingStudent = mockData.students.find(s => s.rollNo === studentData.rollNo || s.email === studentData.email);
      if (existingStudent) {
        return res.status(400).json({ success: false, message: 'Student with this roll number or email already exists' });
      }
      
      // Create student profile
      const newStudent = {
        _id: Date.now().toString(),
        ...studentData,
        isActive: true,
        isApproved: true,
        approvedBy: req.user.profileId,
        approvedAt: new Date()
      };
      
      // Create user account
      const newUser = {
        _id: Date.now().toString() + 'user',
        email: studentData.email,
        password: password, // In real app, this would be hashed
        role: 'student',
        profileId: newStudent._id,
        isActive: true
      };
      
      mockData.students.push(newStudent);
      mockData.users.push(newUser);
      
      // Add password to valid passwords for login
      if (!global.validPasswords) {
        global.validPasswords = {};
      }
      global.validPasswords[studentData.email] = password;
      
      return res.status(201).json({ success: true, data: newStudent });
    }
    
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/students/:id
router.put('/:id', protect, authorize('admin', 'faculty'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/students/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, message: 'Student deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
