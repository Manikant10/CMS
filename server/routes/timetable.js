const express = require('express');
const router  = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/auth');

// GET /api/timetable
router.get('/', protect, async (req, res) => {
  try {
    const { semester, section } = req.query;
    const query = {};

    if (semester) query.semester = parseInt(semester, 10);
    if (section)  query.section  = section;

    // Faculty: only their own timetable entries
    if (req.user.role === 'faculty') {
      query['periods.faculty'] = req.user.profileId;
    }

    const timetable = await Timetable.find(query)
      .populate('periods.course',  'name code type')
      .populate('periods.faculty', 'name empId')
      .sort({ day: 1 });

    res.json({ success: true, data: timetable });
  } catch (error) {
    console.error('GET /timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/timetable/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id)
      .populate('periods.course',  'name code')
      .populate('periods.faculty', 'name empId');
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/timetable — upsert by semester+section+day
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { semester, section, day, periods } = req.body;

    if (!semester || !day) {
      return res.status(400).json({ success: false, message: 'semester and day are required' });
    }

    const entry = await Timetable.findOneAndUpdate(
      { semester, section: section || 'A', day },
      { periods: periods || [] },
      { upsert: true, new: true, runValidators: true }
    )
      .populate('periods.course',  'name code')
      .populate('periods.faculty', 'name empId');

    if (req.io) req.io.emit('timetable-updated', entry);

    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/timetable/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    })
      .populate('periods.course',  'name code')
      .populate('periods.faculty', 'name empId');

    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });

    if (req.io) req.io.emit('timetable-updated', entry);
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/timetable/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
