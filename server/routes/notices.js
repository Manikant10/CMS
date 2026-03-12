const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNotices,
  getNotice,
  createNotice,
  updateNotice,
  deleteNotice
} = require('../controllers/noticeController');

// GET /api/notices
router.get('/', getNotices);

// GET /api/notices/:id
router.get('/:id', protect, getNotice);

// POST /api/notices
router.post('/', protect, authorize('admin', 'faculty'), createNotice);

// PUT /api/notices/:id
router.put('/:id', protect, authorize('admin', 'faculty'), updateNotice);

// DELETE /api/notices/:id
router.delete('/:id', protect, authorize('admin'), deleteNotice);

module.exports = router;
