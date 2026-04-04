const Notice = require('../models/Notice');

// GET /api/notices
exports.getNotices = async (req, res) => {
  try {
    const { category, targetAudience, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };
    if (category)        query.category       = category;
    if (targetAudience)  query.targetAudience = { $in: [targetAudience, 'All'] };

    const pageNum  = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate('postedBy', 'email role')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Notice.countDocuments(query),
    ]);

    res.json({ success: true, data: notices, total, pages: Math.ceil(total / limitNum) });
  } catch (error) {
    console.error('getNotices error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/notices/:id
exports.getNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('postedBy', 'email role');
    if (!notice || !notice.isActive) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/notices
exports.createNotice = async (req, res) => {
  try {
    const { title, content, category, targetAudience, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const notice = await Notice.create({
      title,
      content,
      category:       category       || 'General',
      targetAudience: targetAudience || 'All',
      isPinned:       isPinned       || false,
      postedBy:       req.user._id,
    });

    const populated = await Notice.findById(notice._id).populate('postedBy', 'email role');

    // Real-time broadcast
    if (req.io) req.io.emit('new-notice', populated);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    console.error('createNotice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/notices/:id
exports.updateNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });

    // Faculty can only update their own notices
    if (
      req.user.role === 'faculty' &&
      notice.postedBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'You can only edit your own notices' });
    }

    const { title, content, category, targetAudience, isPinned } = req.body;
    const updated = await Notice.findByIdAndUpdate(
      req.params.id,
      { title, content, category, targetAudience, isPinned },
      { new: true, runValidators: true }
    ).populate('postedBy', 'email role');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/notices/:id — soft delete
exports.deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
