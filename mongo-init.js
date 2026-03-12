// Initialize MongoDB with collections and indexes
db = db.getSiblingDB('bit_cms');

// Create collections
db.createCollection('users');
db.createCollection('students');
db.createCollection('faculty');
db.createCollection('courses');
db.createCollection('timetables');
db.createCollection('admins');
db.createCollection('pendingregistrations');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.students.createIndex({ rollNo: 1 }, { unique: true });
db.students.createIndex({ email: 1 }, { unique: true });
db.students.createIndex({ semester: 1, section: 1 });
db.faculty.createIndex({ empId: 1 }, { unique: true });
db.faculty.createIndex({ email: 1 }, { unique: true });
db.courses.createIndex({ code: 1 }, { unique: true });
db.timetables.createIndex({ semester: 1, section: 1, day: 1 });

// Insert initial admin user
db.users.insertOne({
  _id: 'admin_user',
  email: 'Admin.bit',
  password: 'Bitadmin@1122',
  role: 'admin',
  profileId: 'admin_profile',
  isActive: true,
  createdAt: new Date()
});

// Insert admin profile
db.admins.insertOne({
  _id: 'admin_profile',
  name: 'Admin',
  email: 'Admin.bit',
  phone: '9876543213',
  userId: 'admin_user',
  isActive: true
});

print('Database initialized successfully');
