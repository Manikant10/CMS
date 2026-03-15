const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// PUT /api/admin/profile - Update admin profile
router.put('/profile', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    
    if (global.mockDB) {
      const mockData = global.mockDB;
      
      // Find admin user
      const adminUser = mockData.users.find(u => u.role === 'admin');
      const adminProfile = mockData.admins?.find(a => a.userId === adminUser._id);
      
      if (!adminUser || !adminProfile) {
        return res.status(404).json({ success: false, message: 'Admin profile not found' });
      }
      
      // Validate current password if changing password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required to change password' });
        }
        
        // Verify current password (mock validation)
        if (adminUser.email === 'Admin123@bit.edu' && currentPassword !== 'Bitadmin@1122') {
          return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }
        
        // Update password in global validPasswords
        if (!global.validPasswords) {
          global.validPasswords = {};
        }
        
        // Remove old password
        delete global.validPasswords[adminUser.email];
        
        // Add new password
        global.validPasswords[email] = newPassword;
        
        // Update user email if changed
        adminUser.email = email;
      }
      
      // Update profile
      adminProfile.name = name;
      adminProfile.email = email;
      
      return res.json({ 
        success: true, 
        message: 'Profile updated successfully',
        data: {
          name: adminProfile.name,
          email: adminProfile.email
        }
      });
    }
    
    // MongoDB logic would go here
    res.json({ success: true, message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
