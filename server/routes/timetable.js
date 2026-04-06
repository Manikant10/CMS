const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const { protect, authorize } = require('../middleware/auth');

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIOD_TYPES = ['Lecture', 'Lab', 'Tutorial', 'Break'];

const normalizeDay = (value) => {
  if (value === undefined || value === null) return '';

  if (typeof value === 'number' || /^\d+$/.test(String(value).trim())) {
    const idx = Number(value) - 1;
    return WEEK_DAYS[idx] || '';
  }

  const day = String(value).trim().toLowerCase();
  const match = WEEK_DAYS.find((d) => d.toLowerCase() === day);
  return match || '';
};

const normalizePeriodType = (value) => {
  if (!value) return 'Lecture';
  const normalized = String(value).trim().toLowerCase();
  const match = PERIOD_TYPES.find((type) => type.toLowerCase() === normalized);
  return match || 'Lecture';
};

const normalizePeriod = (period = {}) => {
  let startTime = String(period.startTime || '').trim();
  let endTime = String(period.endTime || '').trim();

  if ((!startTime || !endTime) && period.time) {
    const parts = String(period.time).split('-').map((p) => p.trim());
    if (parts.length === 2) {
      [startTime, endTime] = parts;
    }
  }

  if (!startTime || !endTime) return null;

  return {
    startTime,
    endTime,
    course: period.course || undefined,
    faculty: period.faculty || undefined,
    room: String(period.room || '').trim(),
    type: normalizePeriodType(period.type),
  };
};

const normalizePeriods = (periods) => {
  if (!Array.isArray(periods)) return [];
  return periods.map((period) => normalizePeriod(period)).filter(Boolean);
};

const toPlain = (doc) => (typeof doc?.toObject === 'function' ? doc.toObject() : { ...doc });

const serializePeriod = (periodDoc) => {
  const period = toPlain(periodDoc);
  if (!period.time && period.startTime && period.endTime) {
    period.time = `${period.startTime}-${period.endTime}`;
  }
  return period;
};

const serializeEntry = (entryDoc) => {
  const entry = toPlain(entryDoc);
  const normalizedDay = normalizeDay(entry.day);
  if (normalizedDay) entry.day = normalizedDay;
  entry.periods = Array.isArray(entry.periods) ? entry.periods.map(serializePeriod) : [];
  return entry;
};

const dayIndex = (day) => {
  const normalized = normalizeDay(day);
  return WEEK_DAYS.indexOf(normalized);
};

const sortTimetables = (entries = []) => [...entries].sort((a, b) => {
  const semDiff = Number(a.semester || 0) - Number(b.semester || 0);
  if (semDiff !== 0) return semDiff;

  const dayDiff = dayIndex(a.day) - dayIndex(b.day);
  if (dayDiff !== 0) return dayDiff;

  return String(a.section || '').localeCompare(String(b.section || ''));
});

// GET /api/timetable
router.get('/', protect, async (req, res) => {
  try {
    const { semester, section } = req.query;
    const query = {};

    if (semester) query.semester = parseInt(semester, 10);
    if (section) query.section = String(section).trim().toUpperCase();

    // Faculty: only their own timetable entries
    if (req.user.role === 'faculty') {
      query['periods.faculty'] = req.user.profileId;
    }

    const timetable = await Timetable.find(query)
      .populate('periods.course', 'name code type')
      .populate('periods.faculty', 'name empId')
      .lean(false);

    const serialized = sortTimetables(timetable.map(serializeEntry));
    res.json({ success: true, data: serialized });
  } catch (error) {
    console.error('GET /timetable error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/timetable/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id)
      .populate('periods.course', 'name code')
      .populate('periods.faculty', 'name empId');
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });

    res.json({ success: true, data: serializeEntry(entry) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/timetable — upsert by semester+section+day
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const semester = Number(req.body.semester);
    const section = String(req.body.section || 'A').trim().toUpperCase();
    const day = normalizeDay(req.body.day);
    const periods = normalizePeriods(req.body.periods);

    if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
      return res.status(400).json({ success: false, message: 'Valid semester is required (1-8)' });
    }
    if (!day) {
      return res.status(400).json({ success: false, message: 'Valid day is required' });
    }
    if (periods.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid period is required' });
    }

    const entry = await Timetable.findOneAndUpdate(
      { semester, section, day },
      { $set: { periods } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    )
      .populate('periods.course', 'name code')
      .populate('periods.faculty', 'name empId');

    if (req.io) req.io.emit('timetable-updated', entry);

    res.status(201).json({ success: true, data: serializeEntry(entry) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/timetable/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.semester !== undefined) update.semester = Number(update.semester);
    if (update.section !== undefined) update.section = String(update.section || 'A').trim().toUpperCase();
    if (update.day !== undefined) {
      const normalizedDay = normalizeDay(update.day);
      if (!normalizedDay) {
        return res.status(400).json({ success: false, message: 'Valid day is required' });
      }
      update.day = normalizedDay;
    }
    if (update.periods !== undefined) update.periods = normalizePeriods(update.periods);

    const entry = await Timetable.findByIdAndUpdate(req.params.id, update, {
      new: true, runValidators: true,
    })
      .populate('periods.course', 'name code')
      .populate('periods.faculty', 'name empId');

    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });

    if (req.io) req.io.emit('timetable-updated', entry);
    res.json({ success: true, data: serializeEntry(entry) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const deleteTimetable = async (id, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(id);
    if (!entry) return res.status(404).json({ success: false, message: 'Timetable entry not found' });
    res.json({ success: true, message: 'Timetable entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/timetable/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  await deleteTimetable(req.params.id, res);
});

// POST /api/timetable/:id/delete — fallback for clients/proxies that block DELETE
router.post('/:id/delete', protect, authorize('admin'), async (req, res) => {
  await deleteTimetable(req.params.id, res);
});

module.exports = router;
