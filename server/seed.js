/**
 * seed.js — Development-only seed script
 * Usage: node seed.js
 * WARNING: This will wipe and repopulate the database. Do NOT run in production.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User     = require('./models/User');
const Student  = require('./models/Student');
const Faculty  = require('./models/Faculty');
const Course   = require('./models/Course');
const Notice   = require('./models/Notice');

if (process.env.NODE_ENV === 'production') {
  console.error('❌ Seed script must not be run in production!');
  process.exit(1);
}

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    Course.deleteMany({}),
    Notice.deleteMany({}),
  ]);
  console.log('🗑️  Cleared existing data');

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123456';
  const admin = await User.create({
    email:    process.env.SEED_ADMIN_EMAIL || 'admin@bit.edu',
    password: adminPassword,
    role:     'admin',
    isActive: true,
  });
  console.log(`✅ Admin created: ${admin.email}  password: ${adminPassword}`);

  // ── Faculty ────────────────────────────────────────────────────────────────
  const facultyProfile = await Faculty.create({
    name:           'Dr. Priya Sharma',
    empId:          'FAC001',
    email:          'faculty@bit.edu',
    designation:    'Associate Professor',
    qualification:  'Ph.D. Computer Science',
    specialization: 'Machine Learning',
    phone:          '+91-9876543210',
    isActive:       true,
  });

  const facultyUser = await User.create({
    email:     'faculty@bit.edu',
    password:  'Faculty@123456',
    role:      'faculty',
    profileId: facultyProfile._id,
    isActive:  true,
  });
  facultyProfile.userId = facultyUser._id;
  await facultyProfile.save();
  console.log(`✅ Faculty created: ${facultyUser.email}  password: Faculty@123456`);

  // ── Courses ────────────────────────────────────────────────────────────────
  const courses = await Course.insertMany([
    { code: 'CS101', name: 'Fundamentals of Computer Science', credits: 4, semester: 1, type: 'Theory',  faculty: facultyProfile._id },
    { code: 'CS102', name: 'Programming in C',                 credits: 3, semester: 1, type: 'Lab',     faculty: facultyProfile._id },
    { code: 'MA101', name: 'Engineering Mathematics I',        credits: 4, semester: 1, type: 'Theory',  faculty: facultyProfile._id },
    { code: 'CS201', name: 'Data Structures',                  credits: 4, semester: 2, type: 'Theory',  faculty: facultyProfile._id },
    { code: 'CS202', name: 'Object Oriented Programming',      credits: 3, semester: 2, type: 'Lab',     faculty: facultyProfile._id },
  ]);
  console.log(`✅ ${courses.length} courses created`);

  // ── Students ───────────────────────────────────────────────────────────────
  const studentProfile = await Student.create({
    name:     'Ravi Kumar',
    rollNo:   'BIT2024001',
    email:    'student@bit.edu',
    semester: 1,
    section:  'A',
    batch:    '2024-28',
    phone:    '+91-9876500001',
    isActive: true,
  });

  const studentUser = await User.create({
    email:     'student@bit.edu',
    password:  'Student@123456',
    role:      'student',
    profileId: studentProfile._id,
    isActive:  true,
  });
  studentProfile.userId = studentUser._id;
  await studentProfile.save();
  console.log(`✅ Student created: ${studentUser.email}  password: Student@123456`);

  // ── Notices ────────────────────────────────────────────────────────────────
  await Notice.create({
    title:          'Welcome to BIT CMS',
    content:        'Welcome to the Bhagwant Institute of Technology College Management System. This platform manages academic records, attendance, and notices.',
    category:       'General',
    targetAudience: 'All',
    postedBy:       admin._id,
    isPinned:       true,
    isActive:       true,
  });
  console.log('✅ Sample notice created');

  console.log('\n🎉 Seed complete! Login credentials:');
  console.log(`   Admin:   ${admin.email} / ${adminPassword}`);
  console.log('   Faculty: faculty@bit.edu / Faculty@123456');
  console.log('   Student: student@bit.edu / Student@123456');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
