// Mock database for testing without MongoDB
const mockData = {
  users: [
    {
      _id: '60d0fe4f5311236168a109ca',
      email: 'Admin.bit',
      role: 'admin',
      profileId: '60d0fe4f5311236168a109cb',
      isActive: true
    },
    {
      _id: '60d0fe4f5311236168a109cc',
      email: 'faculty@bit.edu',
      role: 'faculty',
      profileId: '60d0fe4f5311236168a109cd',
      isActive: true
    },
    {
      _id: '60d0fe4f5311236168a109ce',
      email: 'student@bit.edu',
      role: 'student',
      profileId: '60d0fe4f5311236168a109cf',
      isActive: true
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
      batch: '2024-28',
      phone: '9876543210',
      userId: '60d0fe4f5311236168a109ce',
      isActive: true,
      isApproved: true,
      approvedBy: '60d0fe4f5311236168a109ca',
      approvedAt: new Date()
    }
  ],
  faculty: [
    {
      _id: '60d0fe4f5311236168a109cd',
      name: 'Jane Faculty',
      empId: 'FAC001',
      email: 'faculty@bit.edu',
      phone: '9876543211',
      userId: '60d0fe4f5311236168a109cc',
      isActive: true,
      isApproved: true,
      approvedBy: '60d0fe4f5311236168a109ca',
      approvedAt: new Date()
    },
    {
      _id: '60d0fe4f5311236168a109d1',
      name: 'John Faculty',
      empId: 'FAC002',
      email: 'john.faculty@bit.edu',
      phone: '9876543212',
      department: 'Computer Science',
      qualification: 'Ph.D. Computer Science',
      experience: '10',
      specialization: ['AI', 'Machine Learning'],
      userId: '60d0fe4f5311236168a109d2',
      isActive: true,
      isApproved: true,
      approvedBy: '60d0fe4f5311236168a109ca',
      approvedAt: new Date()
    }
  ],
  admins: [
    {
      _id: '60d0fe4f5311236168a109cb',
      name: 'Admin',
      email: 'Admin.bit',
      phone: '9876543213',
      userId: '60d0fe4f5311236168a109ca',
      isActive: true
    }
  ],
  pendingRegistrations: [], // Will store pending student and faculty registrations
  timetables: [
    {
      _id: 'tt001',
      semester: 1,
      section: 'A',
      day: 1, // Monday
      periods: [
        {
          time: '09:00-10:30',
          course: '60d0fe4f5311236168a109d3', // CS101
          faculty: '60d0fe4f5311236168a109cd', // Jane Faculty
          room: 'Room 301'
        },
        {
          time: '11:00-12:30',
          course: '60d0fe4f5311236168a109d5', // CS103
          faculty: '60d0fe4f5311236168a109cd', // Jane Faculty
          room: 'Lab 201'
        }
      ]
    },
    {
      _id: 'tt002',
      semester: 1,
      section: 'A',
      day: 2, // Tuesday
      periods: [
        {
          time: '09:00-10:30',
          course: '60d0fe4f5311236168a109d3', // CS101
          faculty: '60d0fe4f5311236168a109cd', // Jane Faculty
          room: 'Room 301'
        },
        {
          time: '11:00-12:30',
          course: '60d0fe4f5311236168a109d4', // CS102
          faculty: '60d0fe4f5311236168a109d1', // John Faculty
          room: 'Room 302'
        }
      ]
    },
    {
      _id: 'tt003',
      semester: 1,
      section: 'A',
      day: 3, // Wednesday
      periods: [
        {
          time: '09:00-10:30',
          course: '60d0fe4f5311236168a109d4', // CS102
          faculty: '60d0fe4f5311236168a109d1', // John Faculty
          room: 'Room 302'
        },
        {
          time: '11:00-12:30',
          course: '60d0fe4f5311236168a109d5', // CS103
          faculty: '60d0fe4f5311236168a109cd', // Jane Faculty
          room: 'Lab 201'
        }
      ]
    }
  ],
  fees: [
    {
      _id: 'fee001',
      studentId: '60d0fe4f5311236168a109ca',
      studentName: 'Alice Johnson',
      rollNo: 'BIT2021001',
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
          paymentMethod: 'Offline',
          updatedBy: 'admin'
        }
      ],
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-02-10')
    },
    {
      _id: 'fee002',
      studentId: '60d0fe4f5311236168a109cb',
      studentName: 'Bob Smith',
      rollNo: 'BIT2021002',
      semester: 1,
      totalFee: 50000,
      paidAmount: 50000,
      remainingAmount: 0,
      feeBreakdown: [
        {
          type: 'Tuition Fee',
          amount: 30000,
          paid: 30000,
          remaining: 0
        },
        {
          type: 'Library Fee',
          amount: 5000,
          paid: 5000,
          remaining: 0
        },
        {
          type: 'Lab Fee',
          amount: 10000,
          paid: 10000,
          remaining: 0
        },
        {
          type: 'Examination Fee',
          amount: 5000,
          paid: 5000,
          remaining: 0
        }
      ],
      paymentHistory: [
        {
          date: new Date('2024-01-10'),
          amount: 50000,
          paymentNote: 'Full fee payment',
          paymentMethod: 'Offline',
          updatedBy: 'admin'
        }
      ],
      createdAt: new Date('2024-01-01'),
      lastUpdated: new Date('2024-01-10')
    }
  ],
  courses: [
    {
      _id: '60d0fe4f5311236168a109d3',
      code: 'CS101',
      name: 'Computer Science Fundamentals',
      credits: 4,
      semester: 1,
      type: 'Theory',
      faculty: '60d0fe4f5311236168a109cd',
      room: 'Room 301',
      description: 'Introduction to computer science concepts',
      isActive: true,
      createdAt: new Date()
    },
    {
      _id: '60d0fe4f5311236168a109d4',
      code: 'CS102',
      name: 'Data Structures',
      credits: 3,
      semester: 2,
      type: 'Theory',
      faculty: '60d0fe4f5311236168a109d1',
      room: 'Room 302',
      description: 'Fundamental data structures and algorithms',
      isActive: true,
      createdAt: new Date()
    },
    {
      _id: '60d0fe4f5311236168a109d5',
      code: 'CS103',
      name: 'Programming Lab',
      credits: 2,
      semester: 1,
      type: 'Lab',
      faculty: '60d0fe4f5311236168a109cd',
      room: 'Lab 201',
      description: 'Hands-on programming exercises',
      isActive: true,
      createdAt: new Date()
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

const connectDB = async () => {
  console.log('Using Mock Database (MongoDB not required)');
  console.log('Mock data loaded successfully');
  
  // Store mock data globally for controllers to use
  global.mockDB = mockData;
};

module.exports = connectDB;
