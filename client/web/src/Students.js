
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useAuth } from './context/AuthContext';

const socket = io('http://localhost:5000');

function Students() {
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    issuedBooks: 0,
    upcomingExams: [],
  });
  const [timetable, setTimetable] = useState([]);
  const [grades, setGrades] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user, apiCall } = useAuth();

  useEffect(() => {
    fetchData();

    // Listen for real-time updates
    socket.on('attendance-updated', (data) => {
      console.log('Attendance updated:', data);
      fetchData();
    });

    socket.on('timetable-updated', (data) => {
      console.log('Timetable updated:', data);
      fetchData();
    });

    socket.on('fee-updated', (data) => {
      console.log('Fee updated:', data);
      fetchData();
    });

    return () => {
      socket.off('attendance-updated');
      socket.off('timetable-updated');
      socket.off('fee-updated');
    };
  }, [fetchData]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const studentId = user?.profileId;
      
      if (!studentId) {
        console.error('No student ID found');
        setLoading(false);
        return;
      }

      const [statsRes, timetableRes, feesRes] = await Promise.all([
        apiCall(`http://localhost:5000/api/dashboard/stats`),
        apiCall(`http://localhost:5000/api/timetable?semester=1&section=A`),
        apiCall(`http://localhost:5000/api/fees/student/${studentId}`)
      ]);

      const statsData = await statsRes.json();
      const timetableData = await timetableRes.json();
      const feesData = await feesRes.json();

      if (statsData.success) setStats(statsData.data);
      if (timetableData.success) setTimetable(timetableData.data);
      if (feesData.success) setFees([feesData.data]);

      // Mock data for grades and announcements
      setGrades([
        { subject: 'Computer Science', grade: 'A', credits: 4, semester: 1 },
        { subject: 'Mathematics', grade: 'B+', credits: 3, semester: 1 },
        { subject: 'Physics', grade: 'A-', credits: 3, semester: 1 },
        { subject: 'English', grade: 'A', credits: 2, semester: 1 },
      ]);

      setAnnouncements([
        {
          title: 'Mid-Term Examination Schedule',
          content: 'Mid-term examinations will start from next week. Please prepare accordingly.',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          type: 'exam'
        },
        {
          title: 'Library Books Return',
          content: 'Please return all library books before the end of this month.',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          type: 'general'
        }
      ]);

    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Initializing Neural Interface...</div>;

  const renderOverview = () => (
    <div className="student-overview">
      <div className="welcome-section">
        <h3>Welcome back, {user?.name || 'Student'}!</h3>
        <p>Here's your academic overview for this semester</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card attendance">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{stats.attendancePercentage}%</div>
          <div className="stat-label">Attendance</div>
          <div className="stat-bar">
            <div style={{width: `${stats.attendancePercentage}%`}}></div>
          </div>
        </div>
        <div className="stat-card exams">
          <div className="stat-icon">�</div>
          <div className="stat-value">{stats.upcomingExams.length}</div>
          <div className="stat-label">Exams</div>
          <div className="stat-subtitle">Upcoming</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <h3>Recent Announcements</h3>
          <div className="announcements-list">
            {announcements.map((announcement, index) => (
              <div key={index} className={`announcement-item ${announcement.type}`}>
                <div className="announcement-header">
                  <span className="announcement-title">{announcement.title}</span>
                  <span className="announcement-date">
                    {new Date(announcement.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="announcement-content">{announcement.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Quick Actions</h3>
          <div className="quick-actions">
            <button className="action-button">View Timetable</button>
            <button className="action-button">Download Results</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="timetable-section">
      <h3>Class Schedule</h3>
      <div className="timetable-grid">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => {
          const daySchedule = timetable.find(t => t.day === day);
          return ( daySchedule && (
            <div key={day} className="day-column">
              <div className="day-header">{day.toUpperCase()}</div>
              {daySchedule.periods.map((p, idx) => (
                <div key={idx} className={`period-item ${p.type?.toLowerCase() || 'class'}`}>
                  <span className="time">{p.startTime} - {p.endTime}</span>
                  <span className="course">{p.course?.name || 'BREAK'}</span>
                  <span className="room">{p.room || 'N/A'}</span>
                </div>
              ))}
            </div>
          ));
        })}
      </div>
    </div>
  );

  const renderGrades = () => (
    <div className="grades-section">
      <h3>Academic Performance</h3>
      <div className="grades-summary">
        <div className="gpa-card">
          <h4>Current GPA</h4>
          <div className="gpa">3.7</div>
          <div className="scale">Out of 4.0</div>
        </div>
        <div className="credits-card">
          <h4>Total Credits</h4>
          <div className="credits">12</div>
          <div className="scale">This Semester</div>
        </div>
      </div>

      <div className="grades-table">
        <h4>Grade Details</h4>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>GPA Points</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => {
              const gradePoints = {
                'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
                'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7
              };
              return (
                <tr key={index}>
                  <td>{grade.subject}</td>
                  <td>{grade.credits}</td>
                  <td><span className="grade-badge">{grade.grade}</span></td>
                  <td>{gradePoints[grade.grade] || 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFees = () => (
    <div className="fees-section">
      <h3>Fee Status</h3>
      {fees.length > 0 ? (
        <div className="fees-summary">
          <div className="fee-summary-card">
            <h4>Total Fee Status</h4>
            <div className="amount">₹{fees[0].totalFee.toLocaleString()}</div>
            <div className="fee-status-details">
              <div className="paid-amount">
                <span className="label">Paid:</span>
                <span className="value">₹{fees[0].paidAmount.toLocaleString()}</span>
              </div>
              <div className="remaining-amount">
                <span className="label">Remaining:</span>
                <span className="value">₹{fees[0].remainingAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${(fees[0].paidAmount / fees[0].totalFee) * 100}%` }}
              ></div>
            </div>
            <div className="percentage">
              {Math.round((fees[0].paidAmount / fees[0].totalFee) * 100)}% Paid
            </div>
          </div>
          
          <div className="fees-details">
            <h4>Fee Breakdown</h4>
            <div className="fees-list">
              {fees[0].feeBreakdown.map((fee, index) => (
                <div key={index} className={`fee-item ${fee.remaining === 0 ? 'paid' : 'pending'}`}>
                  <div className="fee-info">
                    <span className="type">{fee.type}</span>
                    <span className="total">Total: ₹{fee.amount.toLocaleString()}</span>
                  </div>
                  <div className="fee-amounts">
                    <span className="paid">Paid: ₹{fee.paid.toLocaleString()}</span>
                    <span className="remaining">Remaining: ₹{fee.remaining.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {fees[0].paymentHistory && fees[0].paymentHistory.length > 0 && (
            <div className="payment-history">
              <h4>Payment History</h4>
              <div className="history-list">
                {fees[0].paymentHistory.map((payment, index) => (
                  <div key={index} className="payment-item">
                    <div className="payment-info">
                      <span className="date">{new Date(payment.date).toLocaleDateString()}</span>
                      <span className="amount">₹{payment.amount.toLocaleString()}</span>
                    </div>
                    <div className="payment-details">
                      <span className="note">{payment.paymentNote}</span>
                      <span className="method">{payment.paymentMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="no-fee-data">
          <p>No fee information available. Please contact the admin.</p>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'timetable', label: 'Timetable', icon: '📅' },
    { id: 'fees', label: 'Fees', icon: '💰' },
    { id: 'grades', label: 'Grades', icon: '📝' }
  ];

  return (
    <div className="module-container student-dashboard">
      <h2 className="futuristic-title">STUDENT COMMAND CENTER</h2>
      
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'timetable' && renderTimetable()}
        {activeTab === 'fees' && renderFees()}
        {activeTab === 'grades' && renderGrades()}
      </div>
    </div>
  );
}

export default Students;
