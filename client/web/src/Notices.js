import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import CreateNotice from './CreateNotice';
import apiConfig from './config/api';

const CATEGORY_COLORS = {
  General:   '#6c757d',
  Academic:  '#0d6efd',
  Exam:      '#dc3545',
  Event:     '#198754',
  Placement: '#0dcaf0',
  Sports:    '#fd7e14',
  Other:     '#6c757d',
};

function Notices() {
  const { user, apiCall } = useAuth();
  const [notices,  setNotices]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [category, setCategory] = useState('');

  const fetchNotices = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const url = category
        ? `${apiConfig.endpoints.notices}?category=${category}`
        : apiConfig.endpoints.notices;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.success) setNotices(data.data);
      else setError(data.message || 'Failed to load notices');
    } catch {
      setError('Could not reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      const res  = await apiCall(`${apiConfig.endpoints.notices}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) setNotices(prev => prev.filter(n => n._id !== id));
    } catch {
      alert('Failed to delete notice.');
    }
  };

  const categories = ['', 'General', 'Academic', 'Exam', 'Event', 'Placement', 'Sports', 'Other'];

  return (
    <div className="module-container">
      <div className="module-header">
        <h2>Notices</h2>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="filter-select"
        >
          {categories.map(c => (
            <option key={c} value={c}>{c || 'All Categories'}</option>
          ))}
        </select>
      </div>

      {/* Only admin & faculty can create notices */}
      {user && ['admin', 'faculty'].includes(user.role) && (
        <CreateNotice onCreated={fetchNotices} />
      )}

      {loading && <div className="loading">Loading notices...</div>}
      {error   && <div className="error-msg">{error}</div>}

      {!loading && !error && notices.length === 0 && (
        <div className="empty-state">No notices found.</div>
      )}

      <div className="notices-list">
        {notices.map(notice => (
          <div key={notice._id} className={`notice-item ${notice.isPinned ? 'pinned' : ''}`}>
            {notice.isPinned && <span className="pin-badge">📌 Pinned</span>}
            <div className="notice-header">
              <h3>{notice.title}</h3>
              <span
                className="notice-category-badge"
                style={{ backgroundColor: CATEGORY_COLORS[notice.category] || '#6c757d' }}
              >
                {notice.category}
              </span>
            </div>
            <p className="notice-content">{notice.content}</p>
            <div className="notice-footer">
              <span className="notice-audience">For: {notice.targetAudience}</span>
              <span className="notice-date">
                {new Date(notice.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
              {user && user.role === 'admin' && (
                <button
                  className="btn-danger-sm"
                  onClick={() => handleDelete(notice._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notices;
