const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Mock data helper
const getMockData = () => global.mockDB || {};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, rollNo, empId, semester, batch, phone } = req.body;

    // Prevent admin registration
    if (role === 'admin') {
      return res.status(400).json({ success: false, message: 'Admin registration is not allowed' });
    }

    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const existingUser = mockData.users.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      // Create pending registration instead of active user
      const pendingRegistration = {
        _id: Date.now().toString(),
        email,
        password, // In real app, this would be hashed
        role,
        name,
        rollNo: rollNo || '',
        empId: empId || '',
        semester: semester || '',
        batch: batch || '',
        phone: phone || '',
        isApproved: false,
        createdAt: new Date(),
        status: 'pending'
      };

      // Add to pending registrations
      mockData.pendingRegistrations.push(pendingRegistration);

      return res.status(201).json({
        success: true,
        message: 'Registration submitted successfully. Please wait for admin approval.',
        requiresApproval: true
      });
    }

    // Original MongoDB logic
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ email, password, role });

    // Create profile based on role
    let profile;
    if (role === 'student') {
      profile = await Student.create({
        name, rollNo, email, semester: semester || 1, batch: batch || '2024-28',
        phone, userId: user._id,
      });
    } else if (role === 'faculty') {
      profile = await Faculty.create({
        name, empId, email, phone, userId: user._id,
      });
    }

    if (profile) {
      user.profileId = profile._id;
      await user.save();
    }

    const token = user.getSignedJwtToken();
    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email, role: user.role, profileId: user.profileId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const user = mockData.users.find(u => u.email === email);
      
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check if user is approved (for students and faculty)
      if (user.role !== 'admin') {
        let profile = null;
        if (user.role === 'student') {
          profile = mockData.students.find(s => s._id === user.profileId);
        } else if (user.role === 'faculty') {
          profile = mockData.faculty.find(f => f._id === user.profileId);
        }
        
        if (!profile || !profile.isApproved) {
          return res.status(401).json({ 
            success: false, 
            message: 'Your account is pending admin approval. Please contact the administrator.' 
          });
        }
      }

      // Mock password check (in real app, passwords would be hashed)
      // Use global validPasswords for dynamically added users
      const validPasswords = {
        'Admin.bit': 'Bitadmin@1122',
        'faculty@bit.edu': 'faculty123',
        'student@bit.edu': 'student123',
        ...(global.validPasswords || {})
      };

      if (validPasswords[email] !== password) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Get profile
      let profile = null;
      if (user.role === 'student') {
        profile = mockData.students.find(s => s._id === user.profileId);
      } else if (user.role === 'faculty') {
        profile = mockData.faculty.find(f => f._id === user.profileId);
      } else if (user.role === 'admin') {
        profile = mockData.admins?.find(a => a._id === user.profileId);
      }

      return res.json({
        success: true,
        token: 'mock-token-' + Date.now(),
        user: {
          id: user._id, email: user.email, role: user.role,
          profileId: user.profileId, name: profile?.name || 'Admin',
        },
      });
    }

    // Original MongoDB logic
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Get profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findById(user.profileId);
    } else if (user.role === 'faculty') {
      profile = await Faculty.findById(user.profileId);
    }

    const token = user.getSignedJwtToken();
    res.json({
      success: true,
      token,
      user: {
        id: user._id, email: user.email, role: user.role,
        profileId: user.profileId, name: profile?.name || 'Admin',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    // Check if using mock data
    if (global.mockDB) {
      const mockData = getMockData();
      const user = mockData.users.find(u => u._id === req.user.id);
      
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      let profile = null;
      if (user.role === 'student') {
        profile = mockData.students.find(s => s._id === user.profileId);
      } else if (user.role === 'faculty') {
        profile = mockData.faculty.find(f => f._id === user.profileId);
      }

      return res.json({
        success: true,
        user: {
          id: user._id, email: user.email, role: user.role,
          profileId: user.profileId, profile,
        },
      });
    }

    // Original MongoDB logic
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findById(req.user.profileId);
    } else if (req.user.role === 'faculty') {
      profile = await Faculty.findById(req.user.profileId);
    }
    res.json({
      success: true,
      user: {
        id: req.user._id, email: req.user.email, role: req.user.role,
        profileId: req.user.profileId, profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
