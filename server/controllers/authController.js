const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { email, password, role, name, rollNo, empId, semester, batch, phone } = req.body;

    // Basic validation
    if (!email || !password || !role || !name) {
      return res.status(400).json({ success: false, message: 'email, password, role and name are required' });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid role. Only student or faculty may register' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    // Create user (inactive until approved by admin)
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role,
      isActive: false, // requires admin approval
    });

    // Create role-specific profile
    let profile;
    if (role === 'student') {
      profile = await Student.create({
        name,
        rollNo,
        email: email.toLowerCase(),
        semester: semester || 1,
        batch: batch || '2024-28',
        phone,
        userId: user._id,
      });
    } else if (role === 'faculty') {
      profile = await Faculty.create({
        name,
        employeeId: empId,
        email: email.toLowerCase(),
        phone,
        userId: user._id,
      });
    }

    if (profile) {
      user.profileId = profile._id;
      await user.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. Your account is pending admin approval.',
      requiresApproval: true,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Always fetch password field explicitly (select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending admin approval. Please contact the administrator.',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Fetch role-specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await Student.findById(user.profileId).select('name rollNo semester');
    } else if (user.role === 'faculty') {
      profile = await Faculty.findById(user.profileId).select('name employeeId department');
    }

    const token = user.getSignedJwtToken();

    return res.json({
      success: true,
      token,
      user: {
        id:        user._id,
        email:     user.email,
        role:      user.role,
        profileId: user.profileId,
        name:      profile?.name || 'Admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === 'student') {
      profile = await Student.findById(req.user.profileId);
    } else if (req.user.role === 'faculty') {
      profile = await Faculty.findById(req.user.profileId);
    }

    return res.json({
      success: true,
      user: {
        id:        req.user._id,
        email:     req.user.email,
        role:      req.user.role,
        profileId: req.user.profileId,
        profile,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    return res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
};
