
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-use-before-define */

import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

function FacultyDashboard() {
  const [facultyData, setFacultyData] = useState({
    assignedCourses: 0,
    courses: [],
    todayClasses: [],
    students: [],
    attendanceStats: {},
    pendingTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [attendanceData, setAttendanceData] = useState({});
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timetables, setTimetables] = useState([]);
  const { apiCall } = useAuth();

  useEffect(() => {
    fetchFacultyData();
    fetchTimetables();
  }, [fetchFacultyData, fetchTimetables]);

  const fetchFacultyData = async () => {
    try {
      const response = await apiCall('http://localhost:5000/api/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setFacultyData(data.data);
        
        // Mock additional data for faculty
        setFacultyData(prev => ({
          ...prev,
          students: [
            { id: 1, name: 'John Student', rollNo: 'BIT2024001', attendance: 85, grade: 'A' },
            { id: 2, name: 'Jane Student', rollNo: 'BIT2024002', attendance: 92, grade: 'A-' },
            { id: 3, name: 'Bob Student', rollNo: 'BIT2024003', attendance: 78, grade: 'B+' },
            { id: 4, name: 'Alice Student', rollNo: 'BIT2024004', attendance: 88, grade: 'A' },
            { id: 5, name: 'Charlie Student', rollNo: 'BIT2024005', attendance: 95, grade: 'A+' },
          ],
          attendanceStats: {
            totalClasses: 45,
            conductedClasses: 42,
            averageAttendance: 87.6,
            presentToday: 28,
            absentToday: 3
          },
          pendingTasks: [
            { id: 1, title: 'Grade Mid-term Exams', dueDate: '2024-03-15', priority: 'high' },
            { id: 2, title: 'Submit Attendance Reports', dueDate: '2024-03-12', priority: 'medium' },
            { id: 3, title: 'Update Course Materials', dueDate: '2024-03-18', priority: 'low' },
          ]
        }));
        
        // Initialize attendance data
        const initialAttendance = {};
        data.data.students?.forEach(student => {
          initialAttendance[student.id] = 'present';
        });
        setAttendanceData(initialAttendance);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetables = async () => {
    try {
      const response = await apiCall('http://localhost:5000/api/timetable?role=faculty');
      const data = await response.json();
      if (data.success) {
        setTimetables(data.data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const saveAttendance = async () => {
    try {
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId: parseInt(studentId),
        courseId: selectedCourse?.id || 1,
        date: selectedDate,
        status: status,
        markedBy: facultyData.facultyId || 'faculty-001'
      }));

      const response = await apiCall('http://localhost:5000/api/attendance', {
        method: 'POST',
        body: JSON.stringify({ attendance: attendanceRecords })
      });

      const data = await response.json();
      if (data.success) {
        alert('Attendance saved successfully!');
        setShowAttendanceModal(false);
        fetchFacultyData(); // Refresh data
      } else {
        alert(data.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  if (loading) return <div className="loading">Initializing Faculty Interface...</div>;

  const renderAttendance = () => (
    <div className="tab-content">
      <div className="section-header">
        <h3 className="futuristic-title">Attendance Management</h3>
        <div className="filter-controls">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
          <select
            value={selectedCourse?.id || ''}
            onChange={(e) => setSelectedCourse(facultyData.courses.find(c => c.id === parseInt(e.target.value)))}
          >
            <option value="">Select Course</option>
            {facultyData.courses?.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>
          <button 
            className="action-button primary"
            onClick={() => setShowAttendanceModal(true)}
            disabled={!selectedCourse}
          >
            Take Attendance
          </button>
        </div>
      </div>

      <div className="attendance-summary">
        <div className="summary-card">
          <h4>Today's Attendance</h4>
          <div className="numbers">
            <div className="present">{facultyData.attendanceStats?.presentToday || 0}</div>
            <div className="total">/{facultyData.students?.length || 0}</div>
          </div>
          <p>Present</p>
        </div>
        <div className="summary-card">
          <h4>Average Attendance</h4>
          <div className="percentage">{facultyData.attendanceStats?.averageAttendance || 0}%</div>
          <p>This Semester</p>
        </div>
        <div className="summary-card">
          <h4>Classes Conducted</h4>
          <div className="numbers">
            <div className="conducted">{facultyData.attendanceStats?.conductedClasses || 0}</div>
            <div className="total">/{facultyData.attendanceStats?.totalClasses || 0}</div>
          </div>
          <p>Total Classes</p>
        </div>
      </div>

      <div className="attendance-form">
        <h4>Recent Attendance Records</h4>
        <div className="attendance-grid">
          {facultyData.students?.map(student => (
            <div key={student.id} className="attendance-item">
              <div className="student-info">
                <div className="roll-no">{student.rollNo}</div>
                <div className="name">{student.name}</div>
              </div>
              <div className="attendance-mini">
                <span className="present">P: {Math.floor(student.attendance / 100 * 45)}</span>
                <span className="absent">A: {45 - Math.floor(student.attendance / 100 * 45)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Mark Attendance - {selectedCourse?.name}</h3>
            <p>Date: {new Date(selectedDate).toLocaleDateString()}</p>
            
            <div className="attendance-grid">
              {facultyData.students?.map(student => (
                <div key={student.id} className="attendance-item">
                  <div className="student-info">
                    <div className="roll-no">{student.rollNo}</div>
                    <div className="name">{student.name}</div>
                  </div>
                  <div className="attendance-options">
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="present"
                        checked={attendanceData[student.id] === 'present'}
                        onChange={() => handleAttendanceChange(student.id, 'present')}
                      />
                      Present
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="absent"
                        checked={attendanceData[student.id] === 'absent'}
                        onChange={() => handleAttendanceChange(student.id, 'absent')}
                      />
                      Absent
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`attendance-${student.id}`}
                        value="late"
                        checked={attendanceData[student.id] === 'late'}
                        onChange={() => handleAttendanceChange(student.id, 'late')}
                      />
                      Late
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="attendance-actions">
              <button 
                className="action-button primary"
                onClick={saveAttendance}
              >
                Save Attendance
              </button>
              <button 
                className="action-button secondary"
                onClick={() => setShowAttendanceModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

const renderOverview = () => (
  <div className="faculty-overview">
    <div className="welcome-section">
      <h3>Welcome back, Professor!</h3>
      <p>Here's your teaching dashboard for today</p>
    </div>

    <div className="stats-grid">
      <div className="stat-card courses">
        <div className="stat-icon">📚</div>
        <div className="stat-value">{facultyData.assignedCourses}</div>
        <div className="stat-label">Assigned Courses</div>
        <div className="stat-subtitle">This semester</div>
      </div>
      <div className="stat-card classes">
        <div className="stat-icon">📅</div>
        <div className="stat-value">{facultyData.todayClasses?.length || 0}</div>
        <div className="stat-label">Classes Today</div>
        <div className="stat-subtitle">Scheduled</div>
      </div>
      <div className="stat-card attendance">
        <div className="stat-icon">📊</div>
        <div className="stat-value">{facultyData.attendanceStats?.averageAttendance || 0}%</div>
        <div className="stat-label">Average Attendance</div>
        <div className="stat-subtitle">This semester</div>
      </div>
      <div className="stat-card tasks">
        <div className="stat-icon">📝</div>
        <div className="stat-value">{facultyData.pendingTasks?.length || 0}</div>
        <div className="stat-label">Pending Tasks</div>
        <div className="stat-subtitle">To complete</div>
      </div>
    </div>

    <div className="dashboard-grid">
      <div className="dashboard-section">
        <h3>Today's Schedule</h3>
        <div className="today-schedule">
          {facultyData.todayClasses?.map(c => (
            <div key={c._id} className="schedule-item">
              <div className="time-slot">
                <span className="time">09:00 - 10:30</span>
                <span className="room">Room 301</span>
              </div>
              <div className="class-info">
                <h4>{c.periods?.[0]?.course?.name || 'Computer Science'}</h4>
                <p>Section A • Semester 1</p>
                <div className="attendance-mini">
                  <span className="present">28 Present</span>
                  <span className="absent">3 Absent</span>
                </div>
              </div>
              <div className="class-actions">
                <button className="action-button">Mark Attendance</button>
                <button className="action-button">View Details</button>
              </div>
            </div>
          ))}
          {(!facultyData.todayClasses || facultyData.todayClasses.length === 0) && (
            <div className="empty-message">No classes scheduled for today</div>
          )}
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Pending Tasks</h3>
        <div className="tasks-grid">
          {facultyData.pendingTasks?.map(task => (
            <div key={task.id} className={`task-card priority-${task.priority}`}>
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
              </div>
              <div className="task-meta">
                <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="task-actions">
                <button className="action-button">Complete</button>
                <button className="action-button">Postpone</button>
              </div>
            </div>
          ))}
          {(!facultyData.pendingTasks || facultyData.pendingTasks.length === 0) && (
            <div className="empty-message">No pending tasks</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const renderCourses = () => (
  <div className="tab-content">
    <div className="section-header">
      <h3 className="futuristic-title">Course Management</h3>
      <button className="action-button primary">Add New Course</button>
    </div>
    <div className="courses-grid">
      {facultyData.courses?.map(course => (
        <div key={course.id} className="course-card">
          <div className="course-header">
            <h4>{course.name}</h4>
            <span className="course-code">{course.code}</span>
          </div>
          <div className="course-details">
            <p><strong>Semester:</strong> {course.semester}</p>
            <p><strong>Credits:</strong> {course.credits}</p>
            <p><strong>Type:</strong> {course.type}</p>
            <p><strong>Students:</strong> {course.students?.length || 0}</p>
          </div>
          <div className="course-actions">
            <button className="table-action">View</button>
            <button className="table-action">Edit</button>
            <button className="table-action">Attendance</button>
          </div>
        </div>
      ))}
      {(!facultyData.courses || facultyData.courses.length === 0) && (
        <div className="empty-message">No courses assigned</div>
      )}
    </div>
  </div>
);

const renderStudents = () => (
  <div className="tab-content">
    <div className="section-header">
      <h3 className="futuristic-title">Student Management</h3>
      <div className="filter-controls">
        <select>
          <option>All Courses</option>
          {facultyData.courses?.map(course => (
            <option key={course._id}>{course.name}</option>
          ))}
        </select>
        <input type="text" placeholder="Search students..." />
      </div>
    </div>
    
    <div className="students-table">
      <table>
        <thead>
          <tr>
            <th>Roll Number</th>
            <th>Name</th>
            <th>Course</th>
            <th>Attendance</th>
            <th>Grade</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {facultyData.students?.map(student => (
            <tr key={student.id}>
              <td>{student.rollNo}</td>
              <td>{student.name}</td>
              <td>Computer Science</td>
              <td>
                <div className="attendance-bar">
                  <div 
                    className="attendance-fill" 
                    style={{ width: `${student.attendance}%` }}
                  ></div>
                  <span className="attendance-text">{student.attendance}%</span>
                </div>
              </td>
              <td><span className="grade-badge">{student.grade}</span></td>
              <td>
                <button className="table-action">View</button>
                <button className="table-action">Grade</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const renderTimetable = () => (
  <div className="timetable-view">
    <div className="section-header">
      <h3 className="futuristic-title">My Teaching Schedule</h3>
    </div>
    
    <div className="timetable-container">
      {timetables.length === 0 ? (
        <div className="empty-message">No teaching schedule available</div>
      ) : (
        <div className="weekly-timetable">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIndex) => {
            const dayTimetables = timetables.filter(t => t.day === dayIndex + 1);
            return (
              <div key={day} className="day-column">
                <h4>{day}</h4>
                {dayTimetables.map((timetable) => (
                  <div key={timetable._id} className="day-schedule">
                    <div className="schedule-header">
                      <span className="semester-info">Semester {timetable.semester} - Section {timetable.section}</span>
                    </div>
                    {timetable.periods.map((period, index) => (
                      <div key={index} className="period-block faculty-period">
                        <div className="period-time">{period.time}</div>
                        <div className="period-info">
                          <p className="course-name">{period.course?.name || 'N/A'}</p>
                          <p className="course-code">{period.course?.code || 'N/A'}</p>
                          <p className="room-info">Room: {period.room}</p>
                          <p className="section-info">Section {timetable.section}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);

const renderAssignments = () => (
  <div className="tab-content">
    <div className="section-header">
      <h3 className="futuristic-title">Assignments & Evaluations</h3>
      <button className="action-button primary">Create Assignment</button>
    </div>
    
    <div className="assignments-grid">
      <div className="assignment-card">
        <div className="assignment-header">
          <h4>Data Structures Assignment</h4>
          <span className="course-code">CS101</span>
        </div>
        <div className="assignment-details">
          <p><strong>Posted:</strong> Feb 1, 2024</p>
          <p><strong>Due:</strong> Feb 15, 2024</p>
          <p><strong>Type:</strong> Programming Assignment</p>
          <p><strong>Weight:</strong> 10%</p>
        </div>
        <div className="submission-stats">
          <div className="stat">
            <span className="count">23</span>
            <span className="label">Submitted</span>
          </div>
          <div className="stat">
            <span className="count">8</span>
            <span className="label">Pending</span>
          </div>
          <div className="stat">
            <span className="count">2</span>
            <span className="label">Late</span>
          </div>
        </div>
        <div className="assignment-actions">
          <button className="action-button">View Submissions</button>
          <button className="action-button">Grade</button>
        </div>
      </div>
    </div>
  </div>
);

const tabs = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'courses', label: 'Courses', icon: '📚' },
  { id: 'students', label: 'Students', icon: '🎓' },
  { id: 'attendance', label: 'Attendance', icon: '📅' },
  { id: 'timetable', label: 'Timetable', icon: '📋' },
  { id: 'assignments', label: 'Assignments', icon: '📝' }
];

return (
  <div className="module-container faculty-dashboard">
    <h2 className="futuristic-title">FACULTY COMMAND CENTER</h2>
    
    <div className="faculty-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.id)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>

    <div className="tab-content">
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'courses' && renderCourses()}
      {activeTab === 'students' && renderStudents()}
      {activeTab === 'attendance' && renderAttendance()}
      {activeTab === 'timetable' && renderTimetable()}
      {activeTab === 'assignments' && renderAssignments()}
    </div>
  </div>
);
}

export default FacultyDashboard;
