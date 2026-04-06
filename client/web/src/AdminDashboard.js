
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-use-before-define */

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
    totalNotices: 0,
    totalBooks: 0,
    pendingBookIssues: 0,
    pendingRegistrations: 0,
    recentPayments: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectTarget, setRejectTarget] = useState({ id: '', name: '' });
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [timetables, setTimetables] = useState([]);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [timetableForm, setTimetableForm] = useState({
    semester: '',
    section: '',
    day: '',
    periods: []
  });
  const [currentPeriod, setCurrentPeriod] = useState({
    time: '',
    course: '',
    faculty: '',
    room: ''
  });
  const [fees, setFees] = useState([]);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const defaultSystemSettings = {
    institutionName: 'Bhagwant Institute of Technology',
    academicYear: '2024-2025',
    emailNotifications: true,
    smsNotifications: true
  };
  const [systemSettings, setSystemSettings] = useState(defaultSystemSettings);
  const [adminProfile, setAdminProfile] = useState({
    name: 'Admin',
    email: 'admin@bit.edu'
  });
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    totalFee: 50000,
    feeBreakdown: [
      { type: 'Tuition Fee', amount: 30000 },
      { type: 'Library Fee', amount: 5000 },
      { type: 'Lab Fee', amount: 10000 },
      { type: 'Examination Fee', amount: 5000 }
    ]
  });
  const [paymentForm, setPaymentForm] = useState({
    paidAmount: '',
    paymentNote: ''
  });
  const { apiCall, user } = useAuth();

  // Student form state
  const [studentForm, setStudentForm] = useState({
    name: '',
    rollNo: '',
    email: '',
    phone: '',
    semester: '',
    section: '',
    batch: '',
    address: '',
    guardianName: '',
    guardianPhone: ''
  });

  // Faculty form state
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    empId: '',
    email: '',
    phone: '',
    department: '',
    qualification: '',
    experience: '',
    specialization: ''
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    name: '',
    code: '',
    semester: '',
    credits: '',
    type: '',
    faculty: '',
    room: '',
    description: ''
  });

  useEffect(() => {
    const loadData = async () => {
      await fetchAdminData();
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!user) return;
    setAdminProfile({
      name: user.name || 'Admin',
      email: user.email || 'admin@bit.edu'
    });
  }, [user]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bit_cms_admin_settings');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setSystemSettings((prev) => ({ ...prev, ...parsed }));
    } catch (error) {
      console.error('Failed to load admin settings:', error);
    }
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await apiCall('/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await apiCall('/api/students');
      const data = await response.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await apiCall('/api/faculty');
      const data = await response.json();
      if (data.success) {
        setFaculty(data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await apiCall('/api/courses');
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPendingRegistrations = async () => {
    try {
      const response = await apiCall('/api/approvals/pending');
      const data = await response.json();
      if (data.success) {
        setPendingRegistrations(data.data);
      }
    } catch (error) {
      console.error('Error fetching pending registrations:', error);
    }
  };

  const fetchTimetables = async () => {
    try {
      const response = await apiCall('/api/timetable');
      const data = await response.json();
      if (data.success) {
        setTimetables(data.data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const fetchCoursesAndFaculty = async () => {
    try {
      const [coursesResponse, facultyResponse] = await Promise.all([
        apiCall('/api/courses'),
        apiCall('/api/faculty')
      ]);
      
      const coursesData = await coursesResponse.json();
      const facultyData = await facultyResponse.json();
      
      if (coursesData.success) {
        setCourses(coursesData.data);
      }
      if (facultyData.success) {
        setFaculty(facultyData.data);
      }
    } catch (error) {
      console.error('Error fetching courses and faculty:', error);
    }
  };

  // Move useEffect after all function definitions to avoid hoisting issues

  // Fee management functions
  const fetchFees = async () => {
    try {
      const response = await apiCall('/api/fees');
      const data = await response.json();
      if (data.success) {
        setFees(data.data);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const handleCreateFee = async () => {
    try {
      const response = await apiCall('/api/fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feeForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowFeeModal(false);
        setFeeForm({
          studentId: '',
          totalFee: 50000,
          feeBreakdown: [
            { type: 'Tuition Fee', amount: 30000 },
            { type: 'Library Fee', amount: 5000 },
            { type: 'Lab Fee', amount: 10000 },
            { type: 'Examination Fee', amount: 5000 }
          ]
        });
        fetchFees();
      }
    } catch (error) {
      console.error('Error creating fee record:', error);
    }
  };

  const handlePaymentUpdate = async () => {
    try {
      const response = await apiCall(`/api/fees/${selectedFee._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowPaymentModal(false);
        setPaymentForm({ paidAmount: '', paymentNote: '' });
        setSelectedFee(null);
        fetchFees();
      }
    } catch (error) {
      console.error('Error updating fee:', error);
    }
  };

  const openPaymentModal = (fee) => {
    setSelectedFee(fee);
    setPaymentForm({ paidAmount: '', paymentNote: '' });
    setShowPaymentModal(true);
  };

  const deleteFee = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this fee record?')) {
      try {
        const response = await apiCall(`/api/fees/${feeId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchFees();
        }
      } catch (error) {
        console.error('Error deleting fee:', error);
      }
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleAddStudent = async () => {
    try {
      if (!studentForm.email?.trim()) {
        alert('Student email is required');
        return;
      }

      const generatedPassword = generatePassword();
      const payload = {
        ...studentForm,
        email: studentForm.email.trim().toLowerCase(),
        semester: Number(studentForm.semester),
        password: generatedPassword
      };

      const response = await apiCall('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.success) {
        setStudents([...students, data.data]);
        setShowAddStudentModal(false);
        setStudentForm({
          name: '',
          rollNo: '',
          email: '',
          phone: '',
          semester: '',
          section: '',
          batch: ''
        });
        alert(`Student added successfully!\n\nLogin Credentials:\nUsername: ${payload.email}\nPassword: ${generatedPassword}\n\nPlease save these credentials securely.`);
      } else {
        alert('Failed to add student: ' + data.message);
      }
    } catch (error) {
      console.error('Error adding student:', error);
      alert('Error adding student');
    }
  };

  const handleUpdateStudent = async () => {
    try {
      const response = await apiCall(`/api/students/${editingStudent._id}`, {
        method: 'PUT',
        body: JSON.stringify(studentForm)
      });
      const data = await response.json();
      if (data.success) {
        setEditingStudent(null);
        setStudentForm({
          name: '',
          rollNo: '',
          email: '',
          phone: '',
          semester: '',
          section: '',
          batch: '',
          address: '',
          guardianName: '',
          guardianPhone: ''
        });
        fetchStudents();
      } else {
        alert(data.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      alert('Failed to update student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const student = students.find(s => s._id === studentId);
    setDeleteTarget({ type: 'student', id: studentId, name: student?.name || 'Student' });
    setShowDeleteConfirm(true);
  };

  const handleDeleteFaculty = async (facultyId) => {
    const facultyMember = faculty.find(f => f._id === facultyId);
    setDeleteTarget({ type: 'faculty', id: facultyId, name: facultyMember?.name || 'Faculty Member' });
    setShowDeleteConfirm(true);
  };

  const handleDeleteCourse = async (courseId) => {
    const course = courses.find(c => c._id === courseId);
    setDeleteTarget({ type: 'course', id: courseId, name: course?.name || 'Course' });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === 'student') {
        const response = await apiCall(`/api/students/${deleteTarget.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchStudents();
          fetchAdminData();
        } else {
          alert(data.message || 'Failed to delete student');
        }
      } else if (deleteTarget.type === 'faculty') {
        const response = await apiCall(`/api/faculty/${deleteTarget.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchFaculty();
          fetchAdminData();
        } else {
          alert(data.message || 'Failed to delete faculty');
        }
      } else if (deleteTarget.type === 'course') {
        const response = await apiCall(`/api/courses/${deleteTarget.id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          fetchCourses();
          fetchAdminData();
        } else {
          alert(data.message || 'Failed to delete course');
        }
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget({ type: '', id: '', name: '' });
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget({ type: '', id: '', name: '' });
  };

  const handleAddFaculty = async () => {
    try {
      if (!facultyForm.email?.trim()) {
        alert('Faculty email is required');
        return;
      }

      // Generate login credentials
      const generatedPassword = generatePassword();
      const facultyData = {
        ...facultyForm,
        email: facultyForm.email.trim().toLowerCase(),
        password: generatedPassword,
        isActive: true,
        isApproved: true,
        approvedBy: 'admin',
        approvedAt: new Date()
      };

      const response = await apiCall('/api/faculty', {
        method: 'POST',
        body: JSON.stringify(facultyData)
      });
      const data = await response.json();
      if (data.success) {
        setShowAddFacultyModal(false);
        
        // Show credentials to admin
        alert(`Faculty added successfully!\n\nLogin Credentials:\nUsername: ${facultyForm.email}\nPassword: ${generatedPassword}\n\nPlease save these credentials securely.`);
        
        setFacultyForm({
          name: '',
          empId: '',
          email: '',
          phone: '',
          department: '',
          qualification: '',
          experience: '',
          specialization: ''
        });
        fetchFaculty();
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to add faculty');
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      alert('Failed to add faculty');
    }
  };

  const handleUpdateFaculty = async () => {
    try {
      const response = await apiCall(`/api/faculty/${editingFaculty._id}`, {
        method: 'PUT',
        body: JSON.stringify(facultyForm)
      });
      const data = await response.json();
      if (data.success) {
        setEditingFaculty(null);
        setFacultyForm({
          name: '',
          empId: '',
          email: '',
          phone: '',
          department: '',
          qualification: '',
          experience: '',
          specialization: ''
        });
        fetchFaculty();
      } else {
        alert(data.message || 'Failed to update faculty');
      }
    } catch (error) {
      console.error('Error updating faculty:', error);
      alert('Failed to update faculty');
    }
  };

  const openEditStudent = (student) => {
    setEditingStudent(student);
    setStudentForm({
      name: student.name,
      rollNo: student.rollNo,
      email: student.email || '',
      phone: student.phone || '',
      semester: student.semester,
      section: student.section,
      batch: student.batch,
      address: student.address || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || ''
    });
  };

  const openEditFaculty = (faculty) => {
    setEditingFaculty(faculty);
    setFacultyForm({
      name: faculty.name,
      empId: faculty.empId,
      email: faculty.email || '',
      phone: faculty.phone || '',
      department: faculty.department,
      qualification: faculty.qualification || '',
      experience: faculty.experience || '',
      specialization: faculty.specialization ? faculty.specialization.join(', ') : ''
    });
  };

  const handleAddCourse = async () => {
    try {
      const response = await apiCall('/api/courses', {
        method: 'POST',
        body: JSON.stringify(courseForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowAddCourseModal(false);
        setCourseForm({
          name: '',
          code: '',
          semester: '',
          credits: '',
          type: '',
          faculty: '',
          room: '',
          description: ''
        });
        fetchCourses();
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to add course');
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert('Failed to add course');
    }
  };

  const handleUpdateCourse = async () => {
    try {
      const response = await apiCall(`/api/courses/${editingCourse._id}`, {
        method: 'PUT',
        body: JSON.stringify(courseForm)
      });
      const data = await response.json();
      if (data.success) {
        setEditingCourse(null);
        setCourseForm({
          name: '',
          code: '',
          semester: '',
          credits: '',
          type: '',
          faculty: '',
          room: '',
          description: ''
        });
        fetchCourses();
      } else {
        alert(data.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Failed to update course');
    }
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      code: course.code,
      semester: course.semester,
      credits: course.credits,
      type: course.type,
      faculty: course.faculty || '',
      room: course.room || '',
      description: course.description || ''
    });
  };

  const handleApproveRegistration = async (registrationId) => {
    try {
      const response = await apiCall(`/api/approvals/approve/${registrationId}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchPendingRegistrations();
        fetchAdminData();
      } else {
        alert(data.message || 'Failed to approve registration');
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Failed to approve registration');
    }
  };

  const handleRejectRegistration = async (registrationId) => {
    const registration = pendingRegistrations.find(r => r._id === registrationId);
    setRejectTarget({ id: registrationId, name: registration?.name || 'User' });
    setShowRejectConfirm(true);
  };

  const confirmRejectRegistration = async () => {
    try {
      const response = await apiCall(`/api/approvals/reject/${rejectTarget.id}`, {
        method: 'POST'
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchPendingRegistrations();
      } else {
        alert(data.message || 'Failed to reject registration');
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Failed to reject registration');
    } finally {
      setShowRejectConfirm(false);
      setRejectTarget({ id: '', name: '' });
    }
  };

  const cancelRejectRegistration = () => {
    setShowRejectConfirm(false);
    setRejectTarget({ id: '', name: '' });
  };

  const handleAddTimetable = async () => {
    try {
      const response = await apiCall('/api/timetable', {
        method: 'POST',
        body: JSON.stringify(timetableForm)
      });
      const data = await response.json();
      if (data.success) {
        setShowTimetableModal(false);
        setTimetableForm({
          semester: '',
          section: '',
          day: '',
          periods: []
        });
        setCurrentPeriod({
          time: '',
          course: '',
          faculty: '',
          room: ''
        });
        fetchTimetables();
      } else {
        alert(data.message || 'Failed to add timetable');
      }
    } catch (error) {
      console.error('Error adding timetable:', error);
      alert('Failed to add timetable');
    }
  };

  const addPeriod = () => {
    if (currentPeriod.time && currentPeriod.course && currentPeriod.faculty && currentPeriod.room) {
      setTimetableForm({
        ...timetableForm,
        periods: [...timetableForm.periods, { ...currentPeriod }]
      });
      setCurrentPeriod({
        time: '',
        course: '',
        faculty: '',
        room: ''
      });
    } else {
      alert('Please fill all period details');
    }
  };

  const removePeriod = (index) => {
    setTimetableForm({
      ...timetableForm,
      periods: timetableForm.periods.filter((_, i) => i !== index)
    });
  };

  const handleProfileUpdate = async () => {
    try {
      // Validate passwords match
      if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
        alert('New passwords do not match');
        return;
      }

      if (profileForm.newPassword && !profileForm.currentPassword) {
        alert('Current password is required to set a new password');
        return;
      }

      const updateData = {
        name: profileForm.name,
        email: profileForm.email
      };

      // Only include password if it's being changed
      if (profileForm.newPassword) {
        updateData.currentPassword = profileForm.currentPassword;
        updateData.newPassword = profileForm.newPassword;
      }

      const response = await apiCall('/api/admin/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      const data = await response.json();
      if (data.success) {
        const updatedName = data?.data?.name || profileForm.name || 'Admin';
        const updatedEmail = data?.data?.email || profileForm.email;
        setAdminProfile({ name: updatedName, email: updatedEmail });

        try {
          const rawUser = localStorage.getItem('bit_cms_user');
          if (rawUser) {
            const parsed = JSON.parse(rawUser);
            parsed.name = updatedName;
            parsed.email = updatedEmail;
            localStorage.setItem('bit_cms_user', JSON.stringify(parsed));
          }
        } catch (storageError) {
          console.error('Failed to update local user cache:', storageError);
        }

        alert('Profile updated successfully');
        setShowProfileModal(false);
        setProfileForm({
          name: updatedName,
          email: updatedEmail,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const openProfileModal = () => {
    setProfileForm({
      name: adminProfile.name || 'Admin',
      email: adminProfile.email || 'admin@bit.edu',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfileModal(true);
  };

  const handleSaveSystemSettings = () => {
    try {
      localStorage.setItem('bit_cms_admin_settings', JSON.stringify(systemSettings));
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    }
  };

  const handleResetSystemSettings = () => {
    setSystemSettings(defaultSystemSettings);
    localStorage.removeItem('bit_cms_admin_settings');
    alert('Settings reset to defaults');
  };

  // useEffect for tab-based data fetching - moved after all function definitions
  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    } else if (activeTab === 'faculty') {
      fetchFaculty();
    } else if (activeTab === 'courses') {
      fetchCourses();
    } else if (activeTab === 'timetable') {
      fetchTimetables();
      fetchCoursesAndFaculty();
    } else if (activeTab === 'fees') {
      fetchFees();
    }
  }, [activeTab, apiCall, fetchCourses, fetchCoursesAndFaculty, fetchFaculty, fetchFees, fetchStudents, fetchTimetables]);

  const renderStudents = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Student Management</h3>
        <button 
          className="action-button primary"
          onClick={() => setShowAddStudentModal(true)}
        >
          Add New Student
        </button>
      </div>

      <div className="students-table">
        <table>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Semester</th>
              <th>Section</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>{student.rollNo}</td>
                <td>{student.name}</td>
                <td>{student.email || '-'}</td>
                <td>{student.semester}</td>
                <td>{student.section}</td>
                <td>{student.phone || '-'}</td>
                <td>
                  <span className="status active">Active</span>
                </td>
                <td>
                  <button 
                    className="table-action"
                    onClick={() => openEditStudent(student)}
                  >
                    Edit
                  </button>
                  <button 
                    className="table-action"
                    onClick={() => handleDeleteStudent(student._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="empty-message">No students found</div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {(showAddStudentModal || editingStudent) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              editingStudent ? handleUpdateStudent() : handleAddStudent();
            }}>
              <div className="form-row">
                <div className="input-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Roll Number *</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm({...studentForm, rollNo: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Semester *</label>
                  <select
                    name="semester"
                    value={studentForm.semester}
                    onChange={(e) => setStudentForm({...studentForm, semester: e.target.value})}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Section *</label>
                  <select
                    name="section"
                    value={studentForm.section}
                    onChange={(e) => setStudentForm({...studentForm, section: e.target.value})}
                    required
                  >
                    <option value="">Select Section</option>
                    {['A','B','C','D'].map(sec => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="input-group">
                <label>Batch *</label>
                <input
                  type="text"
                  name="batch"
                  value={studentForm.batch}
                  onChange={(e) => setStudentForm({...studentForm, batch: e.target.value})}
                  placeholder="e.g., 2024-2028"
                  required
                />
              </div>
              <div className="input-group">
                <label>Address</label>
                <textarea
                  name="address"
                  value={studentForm.address}
                  onChange={(e) => setStudentForm({...studentForm, address: e.target.value})}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Guardian Name</label>
                  <input
                    type="text"
                    name="guardianName"
                    value={studentForm.guardianName}
                    onChange={(e) => setStudentForm({...studentForm, guardianName: e.target.value})}
                  />
                </div>
                <div className="input-group">
                  <label>Guardian Phone</label>
                  <input
                    type="tel"
                    name="guardianPhone"
                    value={studentForm.guardianPhone}
                    onChange={(e) => setStudentForm({...studentForm, guardianPhone: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setEditingStudent(null);
                    setStudentForm({
                      name: '',
                      rollNo: '',
                      email: '',
                      phone: '',
                      semester: '',
                      section: '',
                      batch: '',
                      address: '',
                      guardianName: '',
                      guardianPhone: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFaculty = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Faculty Management</h3>
        <button 
          className="action-button primary"
          onClick={() => setShowAddFacultyModal(true)}
        >
          Add New Faculty
        </button>
      </div>

      <div className="faculty-grid">
        {faculty.map((facultyMember) => (
          <div key={facultyMember._id} className="faculty-card">
            <div className="faculty-avatar">👨‍🏫</div>
            <div className="faculty-info">
              <h4>{facultyMember.name}</h4>
              <p><strong>ID:</strong> {facultyMember.empId}</p>
              <p><strong>Department:</strong> {facultyMember.department}</p>
              <p><strong>Email:</strong> {facultyMember.email || '-'}</p>
              <p><strong>Phone:</strong> {facultyMember.phone || '-'}</p>
              <p><strong>Qualification:</strong> {facultyMember.qualification || '-'}</p>
              <p><strong>Experience:</strong> {facultyMember.experience || '0'} years</p>
              {facultyMember.specialization && (
                <p>
                  <strong>Specialization:</strong>{' '}
                  {Array.isArray(facultyMember.specialization)
                    ? facultyMember.specialization.join(', ')
                    : facultyMember.specialization}
                </p>
              )}
            </div>
            <div className="faculty-actions">
              <button 
                className="table-action"
                onClick={() => openEditFaculty(facultyMember)}
              >
                Edit
              </button>
              <button 
                className="table-action"
                onClick={() => handleDeleteFaculty(facultyMember._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {faculty.length === 0 && (
          <div className="empty-message">No faculty members found</div>
        )}
      </div>

      {/* Add/Edit Faculty Modal */}
      {(showAddFacultyModal || editingFaculty) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              editingFaculty ? handleUpdateFaculty() : handleAddFaculty();
            }}>
              <div className="form-row">
                <div className="input-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={facultyForm.name}
                    onChange={(e) => setFacultyForm({...facultyForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    name="empId"
                    value={facultyForm.empId}
                    onChange={(e) => setFacultyForm({...facultyForm, empId: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={facultyForm.email}
                    onChange={(e) => setFacultyForm({...facultyForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={facultyForm.phone}
                    onChange={(e) => setFacultyForm({...facultyForm, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Department *</label>
                <input
                  type="text"
                  name="department"
                  value={facultyForm.department}
                  onChange={(e) => setFacultyForm({...facultyForm, department: e.target.value})}
                  required
                />
              </div>
              <div className="input-group">
                <label>Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={facultyForm.qualification}
                  onChange={(e) => setFacultyForm({...facultyForm, qualification: e.target.value})}
                  placeholder="e.g., Ph.D., M.Tech., B.E."
                />
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Experience (years)</label>
                  <input
                    type="number"
                    name="experience"
                    value={facultyForm.experience}
                    onChange={(e) => setFacultyForm({...facultyForm, experience: e.target.value})}
                    min="0"
                  />
                </div>
                <div className="input-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={facultyForm.specialization}
                    onChange={(e) => setFacultyForm({...facultyForm, specialization: e.target.value})}
                    placeholder="e.g., AI, ML, Database, Networks (comma separated)"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => {
                    setShowAddFacultyModal(false);
                    setEditingFaculty(null);
                    setFacultyForm({
                      name: '',
                      empId: '',
                      email: '',
                      phone: '',
                      department: '',
                      qualification: '',
                      experience: '',
                      specialization: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderCourses = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Course Management</h3>
        <button 
          className="action-button primary"
          onClick={() => setShowAddCourseModal(true)}
        >
          Add New Course
        </button>
      </div>

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card">
            <div className="course-header">
              <h4>{course.name}</h4>
              <span className="course-code">{course.code}</span>
            </div>
            <div className="course-details">
              <p><strong>Semester:</strong> {course.semester}</p>
              <p><strong>Credits:</strong> {course.credits}</p>
              <p><strong>Type:</strong> {course.type}</p>
              <p><strong>Faculty:</strong> {course.faculty || 'Not Assigned'}</p>
              <p><strong>Room:</strong> {course.room || 'Not Assigned'}</p>
              {course.description && (
                <p><strong>Description:</strong> {course.description}</p>
              )}
            </div>
            <div className="course-actions">
              <button 
                className="table-action"
                onClick={() => openEditCourse(course)}
              >
                Edit
              </button>
              <button 
                className="table-action"
                onClick={() => handleDeleteCourse(course._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="empty-message">No courses found</div>
        )}
      </div>

      {/* Add/Edit Course Modal */}
      {(showAddCourseModal || editingCourse) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              editingCourse ? handleUpdateCourse() : handleAddCourse();
            }}>
              <div className="form-row">
                <div className="input-group">
                  <label>Course Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={courseForm.name}
                    onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Course Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={courseForm.code}
                    onChange={(e) => setCourseForm({...courseForm, code: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Semester *</label>
                  <select
                    name="semester"
                    value={courseForm.semester}
                    onChange={(e) => setCourseForm({...courseForm, semester: e.target.value})}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Credits *</label>
                  <input
                    type="number"
                    name="credits"
                    value={courseForm.credits}
                    onChange={(e) => setCourseForm({...courseForm, credits: e.target.value})}
                    min="1"
                    max="6"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Course Type *</label>
                  <select
                    name="type"
                    value={courseForm.type}
                    onChange={(e) => setCourseForm({...courseForm, type: e.target.value})}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="elective">Elective</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Faculty</label>
                  <select
                    name="faculty"
                    value={courseForm.faculty}
                    onChange={(e) => setCourseForm({...courseForm, faculty: e.target.value})}
                  >
                    <option value="">Select Faculty</option>
                    {faculty.map(fac => (
                      <option key={fac._id} value={fac._id}>{fac.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Room</label>
                  <input
                    type="text"
                    name="room"
                    value={courseForm.room}
                    onChange={(e) => setCourseForm({...courseForm, room: e.target.value})}
                    placeholder="e.g., Room 301"
                  />
                </div>
                <div className="input-group">
                  <label>Description</label>
                  <input
                    type="text"
                    name="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({...courseForm, description: e.target.value})}
                    placeholder="Course description"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  {editingCourse ? 'Update Course' : 'Add Course'}
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setEditingCourse(null);
                    setCourseForm({
                      name: '',
                      code: '',
                      semester: '',
                      credits: '',
                      type: '',
                      faculty: '',
                      room: '',
                      description: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  {/* Delete Confirmation Modal */}
  {showDeleteConfirm && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete {deleteTarget.name}? This action cannot be undone.</p>
        <div className="modal-actions">
          <button 
            className="action-button primary"
            onClick={confirmDelete}
          >
            Delete
          </button>
          <button 
            className="action-button secondary"
            onClick={cancelDelete}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Reject Confirmation Modal */}
  {showRejectConfirm && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Confirm Rejection</h3>
        <p>Are you sure you want to reject {rejectTarget.name}'s registration? This action cannot be undone.</p>
        <div className="modal-actions">
          <button 
            className="action-button primary"
            onClick={confirmRejectRegistration}
          >
            Reject
          </button>
          <button 
            className="action-button secondary"
            onClick={cancelRejectRegistration}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Admin Profile Modal */}
  {showProfileModal && (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Reset Admin Details</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleProfileUpdate();
        }}>
          <div className="input-group">
            <label>Admin Name</label>
            <input
              type="text"
              name="name"
              value={profileForm.name}
              onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
              required
            />
          </div>
          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              name="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
              required
            />
          </div>
          <div className="input-group">
            <label>Current Password (leave blank if not changing)</label>
            <input
              type="password"
              name="currentPassword"
              value={profileForm.currentPassword}
              onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>New Password (leave blank if not changing)</label>
            <input
              type="password"
              name="newPassword"
              value={profileForm.newPassword}
              onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
            />
          </div>
          <div className="input-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={profileForm.confirmPassword}
              onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="action-button primary">
              Update Profile
            </button>
            <button 
              type="button" 
              className="action-button secondary"
              onClick={() => setShowProfileModal(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  const renderApprovals = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Pending Approvals</h3>
        <div className="approval-stats">
          <span className="stat-badge pending">{pendingRegistrations.length} Pending</span>
        </div>
      </div>

      <div className="pending-registrations-grid">
        {pendingRegistrations.length === 0 ? (
          <div className="empty-message">No pending registrations</div>
        ) : (
          pendingRegistrations.map((registration) => (
            <div key={registration._id} className="registration-card">
              <div className="registration-header">
                <div className="role-badge">{registration.role.toUpperCase()}</div>
                <div className="registration-date">
                  Applied: {new Date(registration.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="registration-details">
                <h4>{registration.name}</h4>
                <p><strong>Email:</strong> {registration.email}</p>
                <p><strong>Phone:</strong> {registration.phone}</p>
                
                {registration.role === 'student' && (
                  <>
                    <p><strong>Roll Number:</strong> {registration.rollNo}</p>
                    <p><strong>Semester:</strong> {registration.semester}</p>
                    <p><strong>Batch:</strong> {registration.batch}</p>
                  </>
                )}
                
                {registration.role === 'faculty' && (
                  <>
                    <p><strong>Employee ID:</strong> {registration.empId}</p>
                  </>
                )}
              </div>
              
              <div className="registration-actions">
                <button 
                  className="action-button primary"
                  onClick={() => handleApproveRegistration(registration._id)}
                >
                  Approve
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => handleRejectRegistration(registration._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Timetable Management</h3>
        <button 
          className="action-button primary"
          onClick={() => setShowTimetableModal(true)}
        >
          Add Timetable Entry
        </button>
      </div>

      <div className="timetable-grid">
        {timetables.map((timetable) => (
          <div key={timetable._id} className="timetable-card">
            <div className="timetable-header">
              <h4>Semester {timetable.semester} - Section {timetable.section}</h4>
              <span className="day-badge">{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][timetable.day - 1]}</span>
            </div>
            <div className="periods-list">
              {timetable.periods.map((period, index) => (
                <div key={index} className="period-item">
                  <div className="period-time">{period.time}</div>
                  <div className="period-details">
                    <p><strong>Course:</strong> {period.course?.name || 'N/A'}</p>
                    <p><strong>Faculty:</strong> {period.faculty?.name || 'N/A'}</p>
                    <p><strong>Room:</strong> {period.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {timetables.length === 0 && (
          <div className="empty-message">No timetable entries found</div>
        )}
      </div>

      {/* Add Timetable Modal */}
      {showTimetableModal && (
        <div className="modal-overlay">
          <div className="modal-content timetable-modal">
            <h3>Add Timetable Entry</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleAddTimetable();
            }}>
              <div className="form-row">
                <div className="input-group">
                  <label>Semester</label>
                  <select
                    name="semester"
                    value={timetableForm.semester}
                    onChange={(e) => setTimetableForm({...timetableForm, semester: e.target.value})}
                    required
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label>Section</label>
                  <select
                    name="section"
                    value={timetableForm.section}
                    onChange={(e) => setTimetableForm({...timetableForm, section: e.target.value})}
                    required
                  >
                    <option value="">Select Section</option>
                    {['A', 'B', 'C'].map(section => (
                      <option key={section} value={section}>Section {section}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label>Day</label>
                  <select
                    name="day"
                    value={timetableForm.day}
                    onChange={(e) => setTimetableForm({...timetableForm, day: e.target.value})}
                    required
                  >
                    <option value="">Select Day</option>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => (
                      <option key={day} value={index + 1}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="periods-section">
                <h4>Periods</h4>
                
                {timetableForm.periods.map((period, index) => (
                  <div key={index} className="period-item">
                    <div className="period-info">
                      <span className="period-time">{period.time}</span>
                      <span className="period-course">{courses.find(c => c._id === period.course)?.name || 'N/A'}</span>
                      <span className="period-faculty">{faculty.find(f => f._id === period.faculty)?.name || 'N/A'}</span>
                      <span className="period-room">{period.room}</span>
                    </div>
                    <button 
                      type="button" 
                      className="action-button secondary small"
                      onClick={() => removePeriod(index)}
                    >
                      Remove
                    </button>
                  </div>
                ))}

                <div className="add-period-form">
                  <h5>Add New Period</h5>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Time</label>
                      <input
                        type="text"
                        placeholder="e.g., 09:00-10:30"
                        value={currentPeriod.time}
                        onChange={(e) => setCurrentPeriod({...currentPeriod, time: e.target.value})}
                      />
                    </div>
                    <div className="input-group">
                      <label>Course</label>
                      <select
                        value={currentPeriod.course}
                        onChange={(e) => setCurrentPeriod({...currentPeriod, course: e.target.value})}
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course._id} value={course._id}>{course.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Faculty</label>
                      <select
                        value={currentPeriod.faculty}
                        onChange={(e) => setCurrentPeriod({...currentPeriod, faculty: e.target.value})}
                      >
                        <option value="">Select Faculty</option>
                        {faculty.map(fac => (
                          <option key={fac._id} value={fac._id}>{fac.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label>Room</label>
                      <input
                        type="text"
                        placeholder="e.g., Room 301"
                        value={currentPeriod.room}
                        onChange={(e) => setCurrentPeriod({...currentPeriod, room: e.target.value})}
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="action-button secondary"
                    onClick={addPeriod}
                  >
                    Add Period
                  </button>
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  Add Timetable
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => {
                    setShowTimetableModal(false);
                    setTimetableForm({
                      semester: '',
                      section: '',
                      day: '',
                      periods: []
                    });
                    setCurrentPeriod({
                      time: '',
                      course: '',
                      faculty: '',
                      room: ''
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderFees = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Fee Management</h3>
        <button 
          className="action-button primary"
          onClick={() => setShowFeeModal(true)}
        >
          Create Fee Record
        </button>
      </div>

      <div className="fees-grid">
        {fees.map(fee => (
          <div key={fee._id} className="fee-card">
            <div className="fee-header">
              <h4>{fee.studentName}</h4>
              <span className="roll-no">{fee.rollNo}</span>
              <span className="semester">Semester {fee.semester}</span>
            </div>
            <div className="fee-details">
              <div className="fee-summary">
                <div className="total-fee">
                  <span className="label">Total Fee:</span>
                  <span className="amount">₹{fee.totalFee.toLocaleString()}</span>
                </div>
                <div className="paid-fee">
                  <span className="label">Paid:</span>
                  <span className="amount paid">₹{fee.paidAmount.toLocaleString()}</span>
                </div>
                <div className="remaining-fee">
                  <span className="label">Remaining:</span>
                  <span className="amount remaining">₹{fee.remainingAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(fee.paidAmount / fee.totalFee) * 100}%` }}
                ></div>
              </div>
              <div className="percentage">
                {Math.round((fee.paidAmount / fee.totalFee) * 100)}% Paid
              </div>
            </div>
            <div className="fee-actions">
              <button 
                className="action-button primary"
                onClick={() => openPaymentModal(fee)}
              >
                Update Payment
              </button>
              <button 
                className="action-button secondary"
                onClick={() => deleteFee(fee._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {fees.length === 0 && (
          <div className="empty-message">No fee records found. Create a fee record for a student.</div>
        )}
      </div>

      {/* Create Fee Modal */}
      {showFeeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Fee Record</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateFee();
            }}>
              <div className="input-group">
                <label>Student</label>
                <select
                  value={feeForm.studentId}
                  onChange={(e) => setFeeForm({...feeForm, studentId: e.target.value})}
                  required
                >
                  <option value="">Select Student</option>
                  {/* This would be populated with actual students */}
                  <option value="60d0fe4f5311236168a109ca">Alice Johnson (BIT2021001)</option>
                  <option value="60d0fe4f5311236168a109cb">Bob Smith (BIT2021002)</option>
                </select>
              </div>
              <div className="input-group">
                <label>Total Fee</label>
                <input
                  type="number"
                  value={feeForm.totalFee}
                  onChange={(e) => setFeeForm({...feeForm, totalFee: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  Create Fee Record
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => setShowFeeModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && selectedFee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Update Payment</h3>
            <div className="payment-info">
              <h4>{selectedFee.studentName} - {selectedFee.rollNo}</h4>
              <div className="current-status">
                <span>Total: ₹{selectedFee.totalFee.toLocaleString()}</span>
                <span>Paid: ₹{selectedFee.paidAmount.toLocaleString()}</span>
                <span>Remaining: ₹{selectedFee.remainingAmount.toLocaleString()}</span>
              </div>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handlePaymentUpdate();
            }}>
              <div className="input-group">
                <label>Payment Amount</label>
                <input
                  type="number"
                  value={paymentForm.paidAmount}
                  onChange={(e) => setPaymentForm({...paymentForm, paidAmount: e.target.value})}
                  placeholder="Enter amount paid"
                  required
                />
              </div>
              <div className="input-group">
                <label>Payment Note</label>
                <textarea
                  value={paymentForm.paymentNote}
                  onChange={(e) => setPaymentForm({...paymentForm, paymentNote: e.target.value})}
                  placeholder="Enter payment details"
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="action-button primary">
                  Update Payment
                </button>
                <button 
                  type="button" 
                  className="action-button secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  const renderOverview = () => (
    <div className="admin-overview">
      <div className="welcome-section">
        <h3>Welcome, Administrator</h3>
        <p>Manage your institution with comprehensive tools and real-time insights</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{stats.totalStudents}</div>
          <div className="stat-label">Total Students</div>
          <div className="stat-change">+12% this semester</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-value">{stats.totalFaculty}</div>
          <div className="stat-label">Total Faculty</div>
          <div className="stat-change">+2 new hires</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Total Courses</div>
          <div className="stat-change">All operational</div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="dashboard-section">
          <h3>System Status</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Database</span>
              <span className="status-value online">Online</span>
            </div>
            <div className="status-item">
              <span className="status-label">API Server</span>
              <span className="status-value online">Operational</span>
            </div>
            <div className="status-item">
              <span className="status-label">Last Backup</span>
              <span className="status-value">2 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Initializing Administrator Interface...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span className="tab-label">Overview</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <span className="tab-icon">👥</span>
          <span className="tab-label">Students</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'faculty' ? 'active' : ''}`}
          onClick={() => setActiveTab('faculty')}
        >
          <span className="tab-icon">👨‍🏫</span>
          <span className="tab-label">Faculty</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <span className="tab-icon">📚</span>
          <span className="tab-label">Courses</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => setActiveTab('approvals')}
        >
          <span className="tab-icon">✅</span>
          <span className="tab-label">Approvals</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'timetable' ? 'active' : ''}`}
          onClick={() => setActiveTab('timetable')}
        >
          <span className="tab-icon">📅</span>
          <span className="tab-label">Timetable</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'fees' ? 'active' : ''}`}
          onClick={() => setActiveTab('fees')}
        >
          <span className="tab-icon">💰</span>
          <span className="tab-label">Fees</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span className="tab-icon">⚙️</span>
          <span className="tab-label">Settings</span>
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'faculty' && renderFaculty()}
        {activeTab === 'courses' && renderCourses()}
        {activeTab === 'approvals' && renderApprovals()}
        {activeTab === 'timetable' && renderTimetable()}
        {activeTab === 'fees' && renderFees()}
        {activeTab === 'settings' && (
          <div className="tab-content">
            <div className="section-header">
              <h3 className="futuristic-title">System Settings</h3>
            </div>
            <div className="settings-grid">
              <div className="setting-group">
                <h4>Admin Profile</h4>
                <div className="setting-item">
                  <label>Admin Name</label>
                  <input type="text" value={adminProfile.name || 'Admin'} disabled />
                </div>
                <div className="setting-item">
                  <label>Admin Email</label>
                  <input type="email" value={adminProfile.email || 'admin@bit.edu'} disabled />
                </div>
                <div className="setting-item">
                  <button 
                    className="action-button primary"
                    onClick={openProfileModal}
                  >
                    Reset Admin Details
                  </button>
                </div>
              </div>
              <div className="setting-group">
                <h4>General Settings</h4>
                <div className="setting-item">
                  <label>Institution Name</label>
                  <input
                    type="text"
                    value={systemSettings.institutionName}
                    onChange={(e) => setSystemSettings({ ...systemSettings, institutionName: e.target.value })}
                  />
                </div>
                <div className="setting-item">
                  <label>Academic Year</label>
                  <input
                    type="text"
                    value={systemSettings.academicYear}
                    onChange={(e) => setSystemSettings({ ...systemSettings, academicYear: e.target.value })}
                  />
                </div>
              </div>
              <div className="setting-group">
                <h4>Notification Settings</h4>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={systemSettings.emailNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, emailNotifications: e.target.checked })}
                    />
                    Enable Email Notifications
                  </label>
                </div>
                <div className="setting-item">
                  <label>
                    <input
                      type="checkbox"
                      checked={systemSettings.smsNotifications}
                      onChange={(e) => setSystemSettings({ ...systemSettings, smsNotifications: e.target.checked })}
                    />
                    Enable SMS Notifications
                  </label>
                </div>
              </div>
            </div>
            <div className="settings-actions">
              <button className="action-button primary" onClick={handleSaveSystemSettings}>Save Settings</button>
              <button className="action-button secondary" onClick={handleResetSystemSettings}>Reset to Defaults</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
