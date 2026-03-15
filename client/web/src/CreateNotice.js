
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

function CreateNotice() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    targetAudience: 'All'
  });
  const [message, setMessage] = useState('');
  const { user, apiCall } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiCall('/api/notices', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Notice created successfully!');
        setFormData({ title: '', content: '', category: 'General', targetAudience: 'All' });
      } else {
        setMessage('Error: ' + data.message);
      }
    } catch (error) {
      setMessage('Error creating notice: ' + error.message);
    }
  };

  // Only show create form for admin and faculty
  if (!user || (user.role !== 'admin' && user.role !== 'faculty')) {
    return null;
  }

  return (
    <div className="create-notice-form">
      <h3>Post New Notice</h3>
      {message && <p className="status-message">{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Notice Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Notice Content"
          value={formData.content}
          onChange={handleChange}
          required
        />
        <div className="form-row">
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="General">General</option>
            <option value="Academic">Academic</option>
            <option value="Event">Event</option>
            <option value="Exam">Exam</option>
          </select>
          <select name="targetAudience" value={formData.targetAudience} onChange={handleChange}>
            <option value="All">All</option>
            <option value="Student">Students</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>
        <button type="submit" className="futuristic-button">Broadcast Notice</button>
      </form>
    </div>
  );
}

export default CreateNotice;
