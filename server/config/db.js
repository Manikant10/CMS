const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
    // Seed initial data if database is empty
    await seedInitialData();
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    try {
      await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });
      await mongoose.connection.collection('users').createIndex({ role: 1 }, { name: 'users_role_index' });
    } catch (error) {
      if (error.code !== 85) { // Ignore "index already exists" error
        console.log('⚠️ Users index creation skipped:', error.message);
      }
    }
    
    // Student indexes
    try {
      await mongoose.connection.collection('students').createIndex({ rollNo: 1 }, { unique: true, name: 'students_rollNo_unique' });
      await mongoose.connection.collection('students').createIndex({ email: 1 }, { unique: true, name: 'students_email_unique' });
    } catch (error) {
      if (error.code !== 85) {
        console.log('⚠️ Students index creation skipped:', error.message);
      }
    }
    
    // Faculty indexes
    try {
      await mongoose.connection.collection('faculty').createIndex({ email: 1 }, { unique: true, name: 'faculty_email_unique' });
      await mongoose.connection.collection('faculty').createIndex({ employeeId: 1 }, { unique: true, name: 'faculty_employeeId_unique' });
    } catch (error) {
      if (error.code !== 85) {
        console.log('⚠️ Faculty index creation skipped:', error.message);
      }
    }
    
    // Course indexes
    try {
      await mongoose.connection.collection('courses').createIndex({ code: 1 }, { unique: true, name: 'courses_code_unique' });
      await mongoose.connection.collection('courses').createIndex({ semester: 1 }, { name: 'courses_semester_index' });
    } catch (error) {
      if (error.code !== 85) {
        console.log('⚠️ Courses index creation skipped:', error.message);
      }
    }
    
    // Timetable indexes
    try {
      await mongoose.connection.collection('timetables').createIndex({ 
        semester: 1, 
        section: 1, 
        day: 1 
      }, { 
        name: 'timetables_sem_section_day_compound' 
      });
    } catch (error) {
      if (error.code !== 85) {
        console.log('⚠️ Timetables index creation skipped:', error.message);
      }
    }
    
    // Fee indexes
    try {
      await mongoose.connection.collection('fees').createIndex({ studentId: 1 }, { unique: true, name: 'fees_studentId_unique' });
      await mongoose.connection.collection('fees').createIndex({ rollNo: 1 }, { name: 'fees_rollNo_index' });
    } catch (error) {
      if (error.code !== 85) {
        console.log('⚠️ Fees index creation skipped:', error.message);
      }
    }
    
    console.log('✅ Database indexes processed successfully');
  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
  }
};

// Seed initial data if database is empty
const seedInitialData = async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Check if any data exists in key collections
    const hasData = await Promise.all([
      mongoose.connection.collection('users').countDocuments().catch(() => 0),
      mongoose.connection.collection('students').countDocuments().catch(() => 0),
      mongoose.connection.collection('faculty').countDocuments().catch(() => 0)
    ]);
    
    // Only seed if collections are empty
    if (hasData.every(count => count === 0)) {
      console.log('🌱 Seeding initial data...');
      await seedData();
      console.log('✅ Initial data seeded successfully');
    } else {
      console.log('📊 Database already contains data, skipping seed');
    }
  } catch (error) {
    console.error('❌ Error checking/seeding data:', error.message);
  }
};

const seedData = async () => {
  try {
    // Import only the data part, not the function
    const mockData = {
      users: [
        {
          _id: '60d0fe4f5311236168a109ca',
          email: 'Admin.bit',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
          role: 'admin',
          profileId: '60d0fe4f5311236168a109cb',
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '60d0fe4f5311236168a109cc',
          email: 'faculty@bit.edu',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
          role: 'faculty',
          profileId: '60d0fe4f5311236168a109cd',
          isActive: true,
          createdAt: new Date()
        },
        {
          _id: '60d0fe4f5311236168a109ce',
          email: 'student@bit.edu',
          password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
          role: 'student',
          profileId: '60d0fe4f5311236168a109cf',
          isActive: true,
          createdAt: new Date()
        }
      ],
      students: [
        {
          _id: '60d0fe4f5311236168a109cf',
          name: 'John Student',
          rollNo: 'BIT2024001',
          email: 'student@bit.edu',
          semester: 1,
          section: 'A',
          batch: '2024-2028',
          phone: '+1234567890',
          address: '123 Student Street, City',
          dateOfBirth: new Date('2005-01-15'),
          gender: 'Male',
          bloodGroup: 'O+',
          nationality: 'Indian',
          admissionDate: new Date('2024-06-01'),
          isActive: true,
          createdAt: new Date()
        }
      ],
      faculty: [
        {
          _id: '60d0fe4f5311236168a109cd',
          name: 'Dr. Jane Faculty',
          email: 'faculty@bit.edu',
          employeeId: 'FAC2024001',
          department: 'Computer Science',
          designation: 'Assistant Professor',
          qualification: 'Ph.D. in Computer Science',
          specialization: 'Artificial Intelligence',
          experience: '5 years',
          phone: '+1234567890',
          address: '123 Faculty Street, City',
          dateOfBirth: new Date('1985-05-20'),
          gender: 'Female',
          bloodGroup: 'B+',
          nationality: 'Indian',
          joiningDate: new Date('2020-01-15'),
          isActive: true,
          createdAt: new Date()
        }
      ],
      courses: [
        {
          _id: '60d0fe4f5311236168a109d1',
          name: 'Computer Science',
          code: 'CS101',
          description: 'Introduction to Computer Science',
          credits: 3,
          semester: 1,
          type: 'Theory',
          faculty: '60d0fe4f5311236168a109cd',
          room: 'Room 101',
          description: 'Fundamentals of computer science',
          isActive: true,
          createdAt: new Date()
        }
      ],
      timetables: [
        {
          _id: '60d0fe4f5311236168a109d2',
          semester: 1,
          section: 'A',
          day: 'Monday',
          periods: [
            {
              time: '09:00-10:00',
              course: '60d0fe4f5311236168a109d1',
              faculty: '60d0fe4f5311236168a109cd',
              room: 'Room 101'
            }
          ],
          createdAt: new Date()
        }
      ],
      fees: [
        {
          _id: 'fee001',
          studentId: '60d0fe4f5311236168a109cf',
          studentName: 'John Student',
          rollNo: 'BIT2024001',
          semester: 1,
          totalFee: 50000,
          paidAmount: 25000,
          remainingAmount: 25000,
          feeBreakdown: [
            {
              type: 'Tuition Fee',
              amount: 30000,
              paid: 15000,
              remaining: 15000
            },
            {
              type: 'Library Fee',
              amount: 5000,
              paid: 2500,
              remaining: 2500
            },
            {
              type: 'Lab Fee',
              amount: 10000,
              paid: 5000,
              remaining: 5000
            },
            {
              type: 'Examination Fee',
              amount: 5000,
              paid: 2500,
              remaining: 2500
            }
          ],
          paymentHistory: [
            {
              date: new Date('2024-01-15'),
              amount: 15000,
              paymentNote: 'First installment',
              paymentMethod: 'Offline',
              updatedBy: 'admin'
            },
            {
              date: new Date('2024-02-10'),
              amount: 10000,
              paymentNote: 'Second installment',
              paymentMethod: 'Online',
              updatedBy: 'admin'
            }
          ],
          createdAt: new Date('2024-01-01'),
          lastUpdated: new Date('2024-02-10')
        }
      ],
      notices: [
        {
          _id: '60d0fe4f5311236168a109d0',
          title: 'Welcome to BIT CMS',
          content: 'This is a comprehensive college management system.',
          category: 'General',
          targetAudience: 'All',
          postedBy: '60d0fe4f5311236168a109ca',
          isActive: true,
          createdAt: new Date(),
          isPinned: true
        }
      ]
    };
    
    // Insert initial data with error handling
    if (mockData.users && Array.isArray(mockData.users) && mockData.users.length > 0) {
      await mongoose.connection.collection('users').insertMany(mockData.users);
      console.log('✅ Users seeded successfully');
    }
    
    if (mockData.students && Array.isArray(mockData.students) && mockData.students.length > 0) {
      await mongoose.connection.collection('students').insertMany(mockData.students);
      console.log('✅ Students seeded successfully');
    }
    
    if (mockData.faculty && Array.isArray(mockData.faculty) && mockData.faculty.length > 0) {
      await mongoose.connection.collection('faculty').insertMany(mockData.faculty);
      console.log('✅ Faculty seeded successfully');
    }
    
    if (mockData.courses && Array.isArray(mockData.courses) && mockData.courses.length > 0) {
      await mongoose.connection.collection('courses').insertMany(mockData.courses);
      console.log('✅ Courses seeded successfully');
    }
    
    if (mockData.timetables && Array.isArray(mockData.timetables) && mockData.timetables.length > 0) {
      await mongoose.connection.collection('timetables').insertMany(mockData.timetables);
      console.log('✅ Timetables seeded successfully');
    }
    
    if (mockData.fees && Array.isArray(mockData.fees) && mockData.fees.length > 0) {
      await mongoose.connection.collection('fees').insertMany(mockData.fees);
      console.log('✅ Fees seeded successfully');
    }
    
    if (mockData.notices && Array.isArray(mockData.notices) && mockData.notices.length > 0) {
      await mongoose.connection.collection('notices').insertMany(mockData.notices);
      console.log('✅ Notices seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding data:', error);
    // Continue even if seeding fails
  }
};

module.exports = connectDB;
