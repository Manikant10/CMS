import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import apiConfig from './config/api';

function FacultyDashboard() {
  const { user, apiCall } = useAuth();
  const [courses,     setCourses]     = useState([]);
  const [timetables,  setTimetables]  = useState([]);
  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [activeTab,   setActiveTab]   = useState('overview');

  // Attendance state
  const [selectedCourse,  setSelectedCourse]  = useState(null);
  const [selectedDate,    setSelectedDate]    = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData,  setAttendanceData]  = useState({});
  const [attendanceSaved, setAttendanceSaved] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [coursesRes, timetableRes] = await Promise.all([
        apiCall('/api/courses'),
        apiCall('/api/timetable'),
      ]);

      const [coursesData, timetableData] = await Promise.all([
        coursesRes.json(),
        timetableRes.json(),
      ]);

      if (coursesData.success)   setCourses(coursesData.data || []);
      if (timetableData.success) setTimetables(timetableData.data || []);
    } catch {
      setError('Failed to load faculty dashboard. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const fetchStudentsForCourse = useCallback(async (courseId) => {
    if (!courseId) return;
    try {
      const res  = await apiCall(`/api/students?limit=200`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        // Initialise all to 'present'
        const init = {};
        (data.data || []).forEach(s => { init[s._id] = 'present'; });
        setAttendanceData(init);
      }
    } catch {
      setAttendanceError('Failed to load students.');
    }
  }, [apiCall]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (selectedCourse) fetchStudentsForCourse(selectedCourse._id);
  }, [selectedCourse, fetchStudentsForCourse]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = async () => {
    setAttendanceSaved(false);
    setAttendanceError('');
    if (!selectedCourse) { setAttendanceError('Please select a course first.'); return; }

    const records = students.map(s => ({
      studentId: s._id,
      courseId:  selectedCourse._id,
      date:      selectedDate,
      status:    attendanceData[s._id] || 'present',
    }));

    try {
      const res  = await apiCall('/api/attendance', {
        method: 'POST',
        body:   JSON.stringify({ attendance: records }),
      });
      const data = await res.json();
      if (data.success) {
        setAttendanceSaved(true);
        setTimeout(() => setAttendanceSaved(false), 3000);
      } else {
        setAttendanceError(data.message || 'Failed to save attendance.');
      }
    } catch {
      setAttendanceError('Server error. Could not save attendance.');
    }
  };

  if (loading) return <div className="loading">Loading Faculty Dashboard...</div>;
  if (error)   return <div className="error-container"><p>{error}</p><button onClick={fetchData}>Retry</button></div>;

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const renderOverview = () => (
    <div className="faculty-overview">
      <div className="welcome-section">
        <h3>Welcome, {user?.name || 'Faculty'}!</h3>
        <p>You have <strong>{courses.length}</strong> course(s) assigned this semester.</p>
      </div>

      <div className="courses-grid">
        {courses.length === 0 ? (
          <p className="empty-state">No courses assigned yet. Contact admin.</p>
        ) : (
          courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-code">{course.code}</div>
              <div className="course-name">{course.name}</div>
              <div className="course-meta">
                Sem {course.semester} · {course.credits} credits · {course.type}
              </div>
              {course.room && <div className="course-room">📍 {course.room}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="timetable-section">
      <h3>Your Teaching Schedule</h3>
      {timetables.length === 0 ? (
        <p className="empty-state">No timetable assigned yet.</p>
      ) : (
        <div className="timetable-grid">
          {DAYS.map(day => {
            const dayEntries = timetables.filter(t => t.day === day);
            if (dayEntries.length === 0) return null;
            return (
              <div key={day} className="day-column">
                <div className="day-header">{day.toUpperCase()}</div>
                {dayEntries.flatMap(entry =>
                  entry.periods.map((p, idx) => (
                    <div key={idx} className={`period-item ${p.type?.toLowerCase() || 'lecture'}`}>
                      <span className="time">{p.startTime}–{p.endTime}</span>
                      <span className="course">{p.course?.name || '—'}</span>
                      <span className="room">{p.room || 'N/A'}</span>
                      <span className="sem-section">Sem {entry.semester} · {entry.section}</span>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderAttendance = () => (
    <div className="attendance-section">
      <h3>Mark Attendance</h3>

      <div className="attendance-controls">
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
        />
        <select
          value={selectedCourse?._id || ''}
          onChange={e => {
            const c = courses.find(c => c._id === e.target.value) || null;
            setSelectedCourse(c);
          }}
        >
          <option value="">— Select Course —</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.code} — {c.name}</option>
          ))}
        </select>
      </div>

      {attendanceError && <p className="error-msg">{attendanceError}</p>}
      {attendanceSaved && <p className="success-msg">✅ Attendance saved successfully!</p>}

      {selectedCourse && students.length > 0 && (
        <>
          <div className="attendance-table">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Late</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td>{s.rollNo}</td>
                    <td>{s.name}</td>
                    {['present', 'absent', 'late'].map(status => (
                      <td key={status} className="status-cell">
                        <input
                          type="radio"
                          name={`att-${s._id}`}
                          value={status}
                          checked={attendanceData[s._id] === status}
                          onChange={() => handleAttendanceChange(s._id, status)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="futuristic-button" onClick={saveAttendance}>
            Save Attendance
          </button>
        </>
      )}

      {selectedCourse && students.length === 0 && (
        <p className="empty-state">No students found.</p>
      )}

      {!selectedCourse && (
        <p className="info-msg">Select a course above to mark attendance.</p>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview',    label: 'Overview',    icon: '📊' },
    { id: 'timetable',   label: 'Timetable',   icon: '📅' },
    { id: 'attendance',  label: 'Attendance',  icon: '✅' },
  ];

  return (
    <div className="module-container faculty-dashboard">
      <h2 className="futuristic-title">FACULTY PORTAL</h2>

      <div className="student-tabs">
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
        {activeTab === 'overview'   && renderOverview()}
        {activeTab === 'timetable'  && renderTimetable()}
        {activeTab === 'attendance' && renderAttendance()}
      </div>
    </div>
  );
}

export default FacultyDashboard;
