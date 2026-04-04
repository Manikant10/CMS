import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import apiConfig from './config/api';

// targetAudience values in the schema are 'All', 'Students', 'Faculty'
function CreateNotice({ onCreated }) {
  const { apiCall } = useAuth();
  const [formData, setFormData] = useState({
    title:          '',
    content:        '',
    category:       'General',
    targetAudience: 'All',
    isPinned:       false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [message,    setMessage]    = useState({ text: '', type: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const res  = await apiCall(apiConfig.endpoints.notices, {
        method: 'POST',
        body:   JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Notice posted successfully!', type: 'success' });
        setFormData({ title: '', content: '', category: 'General', targetAudience: 'All', isPinned: false });
        if (onCreated) onCreated(); // refresh parent list
      } else {
        setMessage({ text: data.message || 'Failed to post notice.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Server error. Please try again.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-notice-form">
      <h3>Post New Notice</h3>
      {message.text && (
        <p className={`status-message ${message.type}`}>{message.text}</p>
      )}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Notice Title"
          value={formData.title}
          onChange={handleChange}
          required
          maxLength={200}
        />
        <textarea
          name="content"
          placeholder="Notice Content"
          value={formData.content}
          onChange={handleChange}
          required
          rows={4}
        />
        <div className="form-row">
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Academic">Academic</option>
            <option value="Exam">Exam</option>
            <option value="Event">Event</option>
            <option value="Placement">Placement</option>
            <option value="Sports">Sports</option>
            <option value="Other">Other</option>
          </select>
          <select name="targetAudience" value={formData.targetAudience} onChange={handleChange}>
            <option value="All">All</option>
            <option value="Students">Students</option>
            <option value="Faculty">Faculty</option>
          </select>
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPinned"
              checked={formData.isPinned}
              onChange={handleChange}
            />
            Pin Notice
          </label>
        </div>
        <button type="submit" className="futuristic-button" disabled={submitting}>
          {submitting ? 'Posting...' : 'Broadcast Notice'}
        </button>
      </form>
    </div>
  );
}

export default CreateNotice;
