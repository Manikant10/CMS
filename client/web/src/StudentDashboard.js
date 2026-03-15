import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import './DashboardLight.css';

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [studentData, setStudentData] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const { apiCall, user } = useAuth();

  useEffect(() => {
    fetchStudentData();
    fetchTimetables();
  }, []);

  const fetchStudentData = async () => {
    try {
      const response = await apiCall('/api/dashboard/student');
      const data = await response.json();
      if (data.success) {
        setStudentData(data.data);
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTimetables = async () => {
    try {
      const response = await apiCall(`/api/timetable?role=student&semester=${user?.semester}&section=${user?.section}`);
      const data = await response.json();
      if (data.success) {
        setTimetables(data.data);
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
    }
  };

  const renderOverview = () => (
    <div className="student-overview">
      <div className="welcome-section">
        <h3>Welcome, {studentData?.name || 'Student'}</h3>
        <p>Your academic portal and learning resources</p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-value">{studentData?.semester || 'N/A'}</div>
          <div className="stat-label">Current Semester</div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-value">{studentData?.section || 'N/A'}</div>
          <div className="stat-label">Section</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{studentData?.batch || 'N/A'}</div>
          <div className="stat-label">Batch</div>
        </div>
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="timetable-view">
      <div className="section-header">
        <h3 className="futuristic-title">My Timetable</h3>
      </div>
      
      <div className="timetable-container">
        {timetables.length === 0 ? (
          <div className="empty-message">No timetable available</div>
        ) : (
          <div className="weekly-timetable">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, dayIndex) => {
              const dayTimetables = timetables.filter(t => t.day === dayIndex + 1);
              return (
                <div key={day} className="day-column">
                  <h4>{day}</h4>
                  {dayTimetables.map((timetable) => (
                    <div key={timetable._id} className="day-schedule">
                      {timetable.periods.map((period, index) => (
                        <div key={index} className="period-block">
                          <div className="period-time">{period.time}</div>
                          <div className="period-info">
                            <p className="course-name">{period.course?.name || 'N/A'}</p>
                            <p className="faculty-name">{period.faculty?.name || 'N/A'}</p>
                            <p className="room-info">Room: {period.room}</p>
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-sidebar">
        <div className="user-profile">
          <div className="avatar">
            <span>{studentData?.name?.charAt(0) || 'S'}</span>
          </div>
          <div className="user-info">
            <h4>{studentData?.name || 'Student'}</h4>
            <p>{studentData?.rollNo || 'N/A'}</p>
            <p>Semester {studentData?.semester || 'N/A'} - Section {studentData?.section || 'N/A'}</p>
          </div>
        </div>

        <div className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <span className="nav-icon">📊</span>
            <span>Overview</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'timetable' ? 'active' : ''}`}
            onClick={() => setActiveTab('timetable')}
          >
            <span className="nav-icon">📅</span>
            <span>Timetable</span>
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="content-header">
          <h2>Student Dashboard</h2>
          <div className="header-actions">
            <button className="action-button" onClick={() => window.location.href = '/login'}>
              Logout
            </button>
          </div>
        </div>

        <div className="main-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'timetable' && renderTimetable()}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
