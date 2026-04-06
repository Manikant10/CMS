import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import apiConfig from './config/api';

function Students() {
  const { user, apiCall } = useAuth();
  const [, setOverview] = useState({});
  const [timetable,    setTimetable]    = useState([]);
  const [fees,         setFees]         = useState([]);
  const [notices,      setNotices]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeTab,    setActiveTab]    = useState('overview');

  const fetchData = useCallback(async () => {
    const studentId = user?.profileId;
    if (!studentId) {
      setError('Student profile not found. Please contact admin.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [overviewRes, timetableRes, feesRes, noticesRes] = await Promise.all([
        apiCall(`${apiConfig.endpoints.dashboard}/overview`),
        apiCall(`${apiConfig.baseURL}/api/timetable?semester=1&section=A`),
        apiCall(`${apiConfig.baseURL}/api/fees/student/${studentId}`),
        apiCall(`${apiConfig.endpoints.notices}?limit=5`),
      ]);

      const [overviewData, timetableData, feesData, noticesData] = await Promise.all([
        overviewRes.json(),
        timetableRes.json(),
        feesRes.json(),
        noticesRes.json(),
      ]);

      if (overviewData.success)  setOverview(overviewData.data);
      if (timetableData.success) setTimetable(timetableData.data || []);
      if (feesData.success)      setFees(Array.isArray(feesData.data) ? feesData.data : [feesData.data].filter(Boolean));
      if (noticesData.success)   setNotices(noticesData.data || []);
    } catch {
      setError('Failed to load your dashboard. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [user, apiCall]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="loading">Loading Student Dashboard...</div>;
  if (error)   return <div className="error-container"><p>{error}</p><button onClick={fetchData}>Retry</button></div>;

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const renderOverview = () => (
    <div className="student-overview">
      <div className="welcome-section">
        <h3>Welcome back, {user?.name || 'Student'}!</h3>
        <p>Here's your academic overview for this semester.</p>
      </div>

      <div className="dashboard-section">
        <h3>Recent Announcements</h3>
        {notices.length === 0 ? (
          <p className="empty-state">No announcements at this time.</p>
        ) : (
          <div className="announcements-list">
            {notices.map(n => (
              <div key={n._id} className={`announcement-item ${n.category?.toLowerCase() || 'general'}`}>
                <div className="announcement-header">
                  <span className="announcement-title">{n.title}</span>
                  <span className="announcement-date">
                    {new Date(n.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <p className="announcement-content">{n.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="timetable-section">
      <h3>Class Schedule</h3>
      {timetable.length === 0 ? (
        <p className="empty-state">No timetable assigned yet.</p>
      ) : (
        <div className="timetable-grid">
          {DAYS.map(day => {
            const daySchedule = timetable.find(t => t.day === day);
            if (!daySchedule) return null;
            return (
              <div key={day} className="day-column">
                <div className="day-header">{day.toUpperCase()}</div>
                {daySchedule.periods.map((p, idx) => (
                  <div key={idx} className="period-item">
                    <span className="time">{p.time}</span>
                    <span className="course">{p.course?.name || 'BREAK'}</span>
                    <span className="room">{p.room || 'N/A'}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderFees = () => (
    <div className="fees-section">
      <h3>Fee Status</h3>
      {fees.length === 0 ? (
        <p className="empty-state">No fee records found. Please contact admin.</p>
      ) : (
        fees.map(fee => (
          <div key={fee._id} className="fee-summary-card">
            <h4>Semester {fee.semester} â€” {fee.feeType || 'Tuition'}</h4>
            <div className="fee-status-details">
              <div><span className="label">Total:</span> â‚¹{(fee.totalAmount || 0).toLocaleString()}</div>
              <div><span className="label">Paid:</span>  â‚¹{(fee.paidAmount  || 0).toLocaleString()}</div>
              <div><span className="label">Due:</span>   â‚¹{((fee.totalAmount || 0) - (fee.paidAmount || 0)).toLocaleString()}</div>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(100, ((fee.paidAmount || 0) / (fee.totalAmount || 1)) * 100)}%` }}
              />
            </div>
            <div className="fee-status-badge" data-status={fee.status}>{fee.status}</div>
            {fee.transactions?.length > 0 && (
              <div className="payment-history">
                <h5>Payment History</h5>
                {fee.transactions.map((t, i) => (
                  <div key={i} className="payment-item">
                    <span>{new Date(t.date).toLocaleDateString('en-IN')}</span>
                    <span>â‚¹{(t.amount || 0).toLocaleString()}</span>
                    <span>{t.method}</span>
                    {t.receiptNo && <span>#{t.receiptNo}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const tabs = [
    { id: 'overview',  label: 'Overview',  icon: 'ðŸ“Š' },
    { id: 'timetable', label: 'Timetable', icon: 'ðŸ“…' },
    { id: 'fees',      label: 'Fees',      icon: 'ðŸ’°' },
  ];

  return (
    <div className="module-container student-dashboard">
      <h2 className="futuristic-title">STUDENT PORTAL</h2>

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
        {activeTab === 'overview'  && renderOverview()}
        {activeTab === 'timetable' && renderTimetable()}
        {activeTab === 'fees'      && renderFees()}
      </div>
    </div>
  );
}

export default Students;

