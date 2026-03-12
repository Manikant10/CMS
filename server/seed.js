require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Student = require('./models/Student');
const Faculty = require('./models/Faculty');
const Course = require('./models/Course');
const Exam = require('./models/Exam');
const Notice = require('./models/Notice');
const LibraryBook = require('./models/LibraryBook');
const Timetable = require('./models/Timetable');
const Fee = require('./models/Fee');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany(), Student.deleteMany(), Faculty.deleteMany(),
      Course.deleteMany(), Exam.deleteMany(), Notice.deleteMany(),
      LibraryBook.deleteMany(), Timetable.deleteMany(), Fee.deleteMany(),
    ]);
    console.log('Cleared existing data');

    // Create Admin
    const adminUser = await User.create({
      email: 'admin@bit.edu.in', password: 'admin123', role: 'admin',
    });
    console.log('Admin created: admin@bit.edu.in / admin123');

    // Create Faculty
    const facultyData = [
      { name: 'Dr. Rajesh Kumar', empId: 'FAC001', email: 'rajesh@bit.edu.in', designation: 'Professor', qualification: 'Ph.D. CS', specialization: 'Data Structures', phone: '9876543210', gender: 'Male' },
      { name: 'Prof. Priya Sharma', empId: 'FAC002', email: 'priya@bit.edu.in', designation: 'Associate Professor', qualification: 'M.Tech', specialization: 'Machine Learning', phone: '9876543211', gender: 'Female' },
      { name: 'Dr. Amit Singh', empId: 'FAC003', email: 'amit@bit.edu.in', designation: 'Assistant Professor', qualification: 'Ph.D. IT', specialization: 'Computer Networks', phone: '9876543212', gender: 'Male' },
      { name: 'Prof. Neha Gupta', empId: 'FAC004', email: 'neha@bit.edu.in', designation: 'Assistant Professor', qualification: 'M.Tech', specialization: 'Database Systems', phone: '9876543213', gender: 'Female' },
      { name: 'Dr. Vikram Patel', empId: 'FAC005', email: 'vikram@bit.edu.in', designation: 'Professor', qualification: 'Ph.D.', specialization: 'Operating Systems', phone: '9876543214', gender: 'Male' },
    ];

    const facultyProfiles = [];
    for (const f of facultyData) {
      const user = await User.create({ email: f.email, password: 'faculty123', role: 'faculty' });
      const profile = await Faculty.create({ ...f, userId: user._id });
      user.profileId = profile._id;
      await user.save();
      facultyProfiles.push(profile);
    }
    console.log('Faculty created (password: faculty123)');

    // Create Courses
    const coursesData = [
      { code: 'CS301', name: 'Data Structures & Algorithms', credits: 4, semester: 3, type: 'Theory', faculty: facultyProfiles[0]._id },
      { code: 'CS302', name: 'Object Oriented Programming', credits: 4, semester: 3, type: 'Theory', faculty: facultyProfiles[1]._id },
      { code: 'CS303', name: 'Computer Organization', credits: 3, semester: 3, type: 'Theory', faculty: facultyProfiles[2]._id },
      { code: 'CS304', name: 'Discrete Mathematics', credits: 3, semester: 3, type: 'Theory', faculty: facultyProfiles[3]._id },
      { code: 'CS305', name: 'DSA Lab', credits: 2, semester: 3, type: 'Lab', faculty: facultyProfiles[0]._id },
      { code: 'CS501', name: 'Machine Learning', credits: 4, semester: 5, type: 'Theory', faculty: facultyProfiles[1]._id },
      { code: 'CS502', name: 'Computer Networks', credits: 4, semester: 5, type: 'Theory', faculty: facultyProfiles[2]._id },
      { code: 'CS503', name: 'Database Management Systems', credits: 4, semester: 5, type: 'Theory', faculty: facultyProfiles[3]._id },
      { code: 'CS504', name: 'Operating Systems', credits: 4, semester: 5, type: 'Theory', faculty: facultyProfiles[4]._id },
      { code: 'CS505', name: 'DBMS Lab', credits: 2, semester: 5, type: 'Lab', faculty: facultyProfiles[3]._id },
    ];
    const courses = await Course.insertMany(coursesData);
    console.log('Courses created');

    // Create Students
    const studentNames = [
      'Rahul Verma', 'Sneha Patel', 'Arjun Yadav', 'Pooja Singh', 'Rohan Sharma',
      'Ananya Gupta', 'Vikash Kumar', 'Divya Chauhan', 'Mohit Agarwal', 'Riya Joshi',
      'Saurabh Mishra', 'Priyanka Tiwari', 'Abhishek Pandey', 'Swati Rao', 'Nikhil Dubey',
      'Kavita Rawat', 'Deepak Negi', 'Shreya Malik', 'Aditya Saxena', 'Tanvi Bhatt',
    ];

    const studentProfiles = [];
    for (let i = 0; i < studentNames.length; i++) {
      const sem = i < 10 ? 3 : 5;
      const rollNo = `BIT${sem === 3 ? '22' : '21'}CS${String(i + 1).padStart(3, '0')}`;
      const email = studentNames[i].toLowerCase().replace(' ', '.') + '@bit.edu.in';

      const user = await User.create({ email, password: 'student123', role: 'student' });
      const profile = await Student.create({
        name: studentNames[i], rollNo, email, semester: sem,
        section: 'A', batch: sem === 3 ? '2022-26' : '2021-25',
        phone: `98765${String(43210 + i).padStart(5, '0')}`, gender: i % 2 === 0 ? 'Male' : 'Female',
        guardianName: `Mr. ${studentNames[i].split(' ')[1]}`, userId: user._id,
      });
      user.profileId = profile._id;
      await user.save();
      studentProfiles.push(profile);
    }
    console.log('Students created (password: student123)');

    // Create Exams
    const examsData = [
      { name: 'Mid Sem 1 - DSA', course: courses[0]._id, date: new Date('2026-03-20'), totalMarks: 30, passingMarks: 12, type: 'Internal', semester: 3 },
      { name: 'Mid Sem 1 - OOP', course: courses[1]._id, date: new Date('2026-03-21'), totalMarks: 30, passingMarks: 12, type: 'Internal', semester: 3 },
      { name: 'Mid Sem 1 - ML', course: courses[5]._id, date: new Date('2026-03-22'), totalMarks: 30, passingMarks: 12, type: 'Internal', semester: 5 },
      { name: 'Assignment 1 - CN', course: courses[6]._id, date: new Date('2026-03-15'), totalMarks: 10, passingMarks: 4, type: 'Assignment', semester: 5 },
    ];
    await Exam.insertMany(examsData);
    console.log('Exams created');

    // Create Notices
    const noticesData = [
      { title: 'Mid Semester Examination Schedule', content: 'Mid semester exams for all semesters will begin from March 20, 2026. Students must carry their ID cards.', category: 'Exam', postedBy: adminUser._id, targetAudience: 'Students', isPinned: true },
      { title: 'Annual Tech Fest - TechVista 2026', content: 'BIT is organizing TechVista 2026 on April 5-6. Register for coding competitions, hackathons, and workshops.', category: 'Event', postedBy: adminUser._id, targetAudience: 'All' },
      { title: 'Campus Placement Drive - Infosys', content: 'Infosys campus placement drive scheduled for April 15, 2026. Eligible students (CGPA > 6.5) must register by March 25.', category: 'Placement', postedBy: adminUser._id, targetAudience: 'Students' },
      { title: 'Library New Arrivals', content: 'New books on AI, Cloud Computing, and Cybersecurity have been added to the library. Visit the library to explore.', category: 'General', postedBy: adminUser._id, targetAudience: 'All' },
      { title: 'Faculty Development Program', content: 'A 5-day FDP on "Emerging Trends in AI/ML" will be conducted from March 25-29, 2026.', category: 'Academic', postedBy: adminUser._id, targetAudience: 'Faculty' },
    ];
    await Notice.insertMany(noticesData);
    console.log('Notices created');

    // Create Library Books
    const booksData = [
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', publisher: 'MIT Press', year: 2009, category: 'CS', totalCopies: 5, availableCopies: 3, location: 'Rack A1' },
      { title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1119800361', publisher: 'Wiley', year: 2021, category: 'CS', totalCopies: 4, availableCopies: 4, location: 'Rack A2' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose', isbn: '978-0136681557', publisher: 'Pearson', year: 2020, category: 'CS', totalCopies: 3, availableCopies: 2, location: 'Rack B1' },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', publisher: 'McGraw Hill', year: 2019, category: 'CS', totalCopies: 4, availableCopies: 4, location: 'Rack B2' },
      { title: 'Machine Learning', author: 'Tom Mitchell', isbn: '978-0070428072', publisher: 'McGraw Hill', year: 1997, category: 'AI/ML', totalCopies: 3, availableCopies: 3, location: 'Rack C1' },
      { title: 'Design Patterns', author: 'Gang of Four', isbn: '978-0201633610', publisher: 'Addison-Wesley', year: 1994, category: 'SE', totalCopies: 3, availableCopies: 3, location: 'Rack C2' },
    ];
    await LibraryBook.insertMany(booksData);
    console.log('Library books created');

    // Create Fee records
    for (const student of studentProfiles) {
      await Fee.create({
        student: student._id, semester: student.semester,
        totalAmount: 45000, dueDate: new Date('2026-04-30'),
        paidAmount: Math.random() > 0.5 ? 45000 : Math.floor(Math.random() * 30000),
        status: Math.random() > 0.5 ? 'Paid' : 'Partial',
        feeType: 'Tuition',
      });
    }
    console.log('Fee records created');

    // Create Timetable for Sem 3 Section A
    const sem3Days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of sem3Days) {
      await Timetable.create({
        semester: 3, section: 'A', day,
        periods: [
          { startTime: '09:00', endTime: '10:00', course: courses[0]._id, faculty: facultyProfiles[0]._id, room: 'CR-101', type: 'Lecture' },
          { startTime: '10:00', endTime: '11:00', course: courses[1]._id, faculty: facultyProfiles[1]._id, room: 'CR-101', type: 'Lecture' },
          { startTime: '11:15', endTime: '12:15', course: courses[2]._id, faculty: facultyProfiles[2]._id, room: 'CR-102', type: 'Lecture' },
          { startTime: '12:15', endTime: '01:00', type: 'Break', room: '', startTime: '12:15', endTime: '13:00' },
          { startTime: '13:00', endTime: '14:00', course: courses[3]._id, faculty: facultyProfiles[3]._id, room: 'CR-101', type: 'Lecture' },
          { startTime: '14:00', endTime: '16:00', course: courses[4]._id, faculty: facultyProfiles[0]._id, room: 'Lab-1', type: 'Lab' },
        ],
      });
    }
    console.log('Timetable created');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login Credentials:');
    console.log('Admin:   admin@bit.edu.in / admin123');
    console.log('Faculty: rajesh@bit.edu.in / faculty123');
    console.log('Student: rahul.verma@bit.edu.in / student123');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
