const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/auth');

// GET /api/timetable
router.get('/', protect, async (req, res) => {
  try {
    const { semester, section, role } = req.query;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      let timetable = mockData.timetables || [];
      
      // Filter by user role
      if (role === 'student' && semester && section) {
        timetable = timetable.filter(t => t.semester === parseInt(semester) && t.section === section);
      } else if (role === 'faculty') {
        // For faculty, get all timetables where they are assigned
        timetable = timetable.filter(t => 
          t.periods.some(p => p.faculty === req.user.profileId)
        );
      }
      
      // Populate course and faculty info
      timetable = timetable.map(t => ({
        ...t,
        periods: t.periods.map(p => ({
          ...p,
          course: mockData.courses.find(c => c._id === p.course),
          faculty: mockData.faculty.find(f => f._id === p.faculty)
        }))
      }));
      
      return res.json({ success: true, data: timetable });
    }
    
    const query = {};
    if (semester) query.semester = semester;
    if (section) query.section = section;
    const timetable = await Timetable.find(query)
      .populate('periods.course', 'name code')
      .populate('periods.faculty', 'name empId')
      .sort({ day: 1 });
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/timetable
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      
      // Create new timetable entry
      const newTimetable = {
        _id: Date.now().toString(),
        ...req.body,
        createdAt: new Date()
      };
      
      // Initialize timetables array if it doesn't exist
      if (!mockData.timetables) {
        mockData.timetables = [];
      }
      
      mockData.timetables.push(newTimetable);
      
      // Emit real-time update
      if (req.io) {
        req.io.emit('timetable-updated', newTimetable);
      }
      
      return res.status(201).json({ success: true, data: newTimetable });
    }
    
    const timetable = await Timetable.findOneAndUpdate(
      { semester: req.body.semester, section: req.body.section, day: req.body.day },
      req.body,
      { upsert: true, new: true }
    );
    req.io.emit('timetable-updated', timetable);
    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/timetable/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!timetable) return res.status(404).json({ success: false, message: 'Timetable not found' });
    res.json({ success: true, data: timetable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Timetable.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
