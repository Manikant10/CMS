const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Register (student/faculty self-signup, pending admin approval)
exports.register = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      role,
      name,
      rollNo,
      empId,
      semester,
      section,
      batch,
      phone,
    } = req.body;

    // Support legacy frontend field `username` as email.
    const normalizedEmail = (email || username || '').trim().toLowerCase();
    const normalizedName = (name || '').trim();

    if (!normalizedEmail || !password || !role || !normalizedName) {
      return res.status(400).json({ success: false, message: 'email, password, role and name are required' });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Only student or faculty may register',
      });
    }

    if (role === 'student' && (!rollNo || !semester || !batch)) {
      return res.status(400).json({
        success: false,
        message: 'rollNo, semester and batch are required for student registration',
      });
    }

    if (role === 'faculty' && !empId) {
      return res.status(400).json({
        success: false,
        message: 'empId is required for faculty registration',
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    if (role === 'student') {
      const existingStudent = await Student.findOne({
        $or: [{ email: normalizedEmail }, { rollNo: String(rollNo).trim() }],
      });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this email or roll number already exists',
        });
      }
    } else {
      const existingFaculty = await Faculty.findOne({
        $or: [{ email: normalizedEmail }, { empId: String(empId).trim() }],
      });
      if (existingFaculty) {
        return res.status(400).json({
          success: false,
          message: 'A faculty member with this email or employee ID already exists',
        });
      }
    }

    // User remains inactive until approved by admin.
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role,
      isActive: false,
    });

    try {
      let profile;

      if (role === 'student') {
        profile = await Student.create({
          name: normalizedName,
          rollNo: String(rollNo).trim(),
          email: normalizedEmail,
          semester: Number(semester),
          section: (section || 'A').trim(),
          batch: String(batch).trim(),
          phone: (phone || '').trim(),
          userId: user._id,
          isActive: false,
        });
      } else {
        profile = await Faculty.create({
          name: normalizedName,
          empId: String(empId).trim(),
          email: normalizedEmail,
          phone: (phone || '').trim(),
          userId: user._id,
          isActive: false,
        });
      }

      user.profileId = profile._id;
      await user.save();
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
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

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

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
      profile = await Student.findById(user.profileId).select('name rollNo semester section');
    } else if (user.role === 'faculty') {
      profile = await Faculty.findById(user.profileId).select('name empId department');
    }

    const token = user.getSignedJwtToken();

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
        name: user.name || profile?.name || 'Admin',
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// Get current user
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
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
        profileId: req.user.profileId,
        profile,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user data.' });
  }
};

// Change password
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