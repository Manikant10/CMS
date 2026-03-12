const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/auth');

// GET /api/faculty
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { empId: { $regex: search, $options: 'i' } },
      ];
    }
    const faculty = await Faculty.find(query).sort({ name: 1 });
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/faculty/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/faculty
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { password, ...facultyData } = req.body;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      
      // Check if faculty already exists
      const existingFaculty = mockData.faculty.find(f => f.empId === facultyData.empId || f.email === facultyData.email);
      if (existingFaculty) {
        return res.status(400).json({ success: false, message: 'Faculty with this employee ID or email already exists' });
      }
      
      // Create faculty profile
      const newFaculty = {
        _id: Date.now().toString(),
        ...facultyData,
        isActive: true,
        isApproved: true,
        approvedBy: req.user.profileId,
        approvedAt: new Date()
      };
      
      // Create user account
      const newUser = {
        _id: Date.now().toString() + 'user',
        email: facultyData.email,
        password: password, // In real app, this would be hashed
        role: 'faculty',
        profileId: newFaculty._id,
        isActive: true
      };
      
      mockData.faculty.push(newFaculty);
      mockData.users.push(newUser);
      
      // Add password to valid passwords for login
      if (!global.validPasswords) {
        global.validPasswords = {};
      }
      global.validPasswords[facultyData.email] = password;
      
      return res.status(201).json({ success: true, data: newFaculty });
    }
    
    const faculty = await Faculty.create(req.body);
    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/faculty/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/faculty/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    res.json({ success: true, message: 'Faculty deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
