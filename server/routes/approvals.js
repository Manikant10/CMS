const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// GET /api/approvals/pending - Get all pending registrations
router.get('/pending', protect, authorize('admin'), async (req, res) => {
  try {
    if (global.mockDB) {
      const mockData = global.mockDB;
      const pendingRegistrations = mockData.pendingRegistrations || [];
      
      return res.json({ 
        success: true, 
        data: pendingRegistrations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      });
    }
    
    // MongoDB logic would go here
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/approve/:id - Approve a registration
router.post('/approve/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const pendingIndex = mockData.pendingRegistrations.findIndex(r => r._id === id);
      
      if (pendingIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pending registration not found' });
      }
      
      const pending = mockData.pendingRegistrations[pendingIndex];
      
      // Create user account
      const newUser = {
        _id: Date.now().toString() + 'user',
        email: pending.email,
        role: pending.role,
        profileId: Date.now().toString() + 'profile',
        isActive: true
      };
      
      // Create profile
      let profile;
      if (pending.role === 'student') {
        profile = {
          _id: newUser.profileId,
          name: pending.name,
          rollNo: pending.rollNo,
          email: pending.email,
          semester: pending.semester,
          section: 'A',
          batch: pending.batch,
          phone: pending.phone,
          userId: newUser._id,
          isActive: true,
          isApproved: true,
          approvedBy: req.user.profileId,
          approvedAt: new Date()
        };
        mockData.students.push(profile);
      } else if (pending.role === 'faculty') {
        profile = {
          _id: newUser.profileId,
          name: pending.name,
          empId: pending.empId,
          email: pending.email,
          phone: pending.phone,
          userId: newUser._id,
          isActive: true,
          isApproved: true,
          approvedBy: req.user.profileId,
          approvedAt: new Date()
        };
        mockData.faculty.push(profile);
      }
      
      // Add user
      mockData.users.push(newUser);
      
      // Remove from pending
      mockData.pendingRegistrations.splice(pendingIndex, 1);
      
      return res.json({ 
        success: true, 
        message: `${pending.role.charAt(0).toUpperCase() + pending.role.slice(1)} approved successfully`,
        data: profile
      });
    }
    
    res.json({ success: true, message: 'Registration approved' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/approvals/reject/:id - Reject a registration
router.post('/reject/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      const pendingIndex = mockData.pendingRegistrations.findIndex(r => r._id === id);
      
      if (pendingIndex === -1) {
        return res.status(404).json({ success: false, message: 'Pending registration not found' });
      }
      
      const pending = mockData.pendingRegistrations[pendingIndex];
      
      // Remove from pending
      mockData.pendingRegistrations.splice(pendingIndex, 1);
      
      return res.json({ 
        success: true, 
        message: `${pending.role.charAt(0).toUpperCase() + pending.role.slice(1)} registration rejected`
      });
    }
    
    res.json({ success: true, message: 'Registration rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
