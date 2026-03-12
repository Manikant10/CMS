const Notice = require('../models/Notice');

// Mock data helper
const getMockData = () => global.mockDB || {};

// @desc    Get all notices
// @route   GET /api/notices
// @access  Public
exports.getNotices = async (req, res) => {
  try {
    const { category, targetAudience, page = 1, limit = 20 } = req.query;

    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      let notices = [...mockData.notices];
      
      // Apply filters
      if (category) {
        notices = notices.filter(n => n.category === category);
      }
      if (targetAudience) {
        notices = notices.filter(n => n.targetAudience === targetAudience || n.targetAudience === 'All');
      }

      // Sort by pinned and creation date
      notices.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedNotices = notices.slice(startIndex, endIndex);

      return res.json({ 
        success: true, 
        data: paginatedNotices, 
        total: notices.length, 
        pages: Math.ceil(notices.length / limit) 
      });
    }

    // Original MongoDB logic
    const query = { isActive: true };
    if (category) query.category = category;
    if (targetAudience) query.targetAudience = { $in: [targetAudience, 'All'] };

    const notices = await Notice.find(query)
      .populate('postedBy', 'email role')
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Notice.countDocuments(query);
    res.json({ success: true, data: notices, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single notice
// @route   GET /api/notices/:id
// @access  Private
exports.getNotice = async (req, res) => {
  try {
    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const notice = mockData.notices.find(n => n._id === req.params.id);
      
      if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
      
      return res.json({ success: true, data: notice });
    }

    // Original MongoDB logic
    const notice = await Notice.findById(req.params.id).populate('postedBy', 'email role');
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create notice
// @route   POST /api/notices
// @access  Private (Admin, Faculty)
exports.createNotice = async (req, res) => {
  try {
    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const newNotice = {
        _id: Date.now().toString(),
        ...req.body,
        postedBy: req.user._id,
        isActive: true,
        createdAt: new Date(),
        isPinned: false
      };

      mockData.notices.unshift(newNotice);
      
      // Emit real-time update
      req.io.emit('new-notice', newNotice);
      
      return res.status(201).json({ success: true, data: newNotice });
    }

    // Original MongoDB logic
    req.body.postedBy = req.user._id;
    const notice = await Notice.create(req.body);
    
    // Emit real-time update
    req.io.emit('new-notice', notice);
    
    res.status(201).json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private (Admin, Faculty)
exports.updateNotice = async (req, res) => {
  try {
    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const noticeIndex = mockData.notices.findIndex(n => n._id === req.params.id);
      
      if (noticeIndex === -1) return res.status(404).json({ success: false, message: 'Notice not found' });
      
      const updatedNotice = { ...mockData.notices[noticeIndex], ...req.body };
      mockData.notices[noticeIndex] = updatedNotice;
      
      return res.json({ success: true, data: updatedNotice });
    }

    // Original MongoDB logic
    const notice = await Notice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!notice) return res.status(404).json({ success: false, message: 'Notice not found' });
    res.json({ success: true, data: notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private (Admin)
exports.deleteNotice = async (req, res) => {
  try {
    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const noticeIndex = mockData.notices.findIndex(n => n._id === req.params.id);
      
      if (noticeIndex === -1) return res.status(404).json({ success: false, message: 'Notice not found' });
      
      mockData.notices[noticeIndex].isActive = false;
      
      return res.json({ success: true, message: 'Notice deleted' });
    }

    // Original MongoDB logic
    await Notice.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
