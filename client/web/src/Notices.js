
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import CreateNotice from './CreateNotice';

const socket = io();

function Notices() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    // Fetch initial notices
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNotices(data.data);
        }
      });

    // Listen for new notices
    socket.on('new-notice', (notice) => {
      setNotices(prevNotices => [notice, ...prevNotices]);
    });

    return () => {
      socket.off('new-notice');
    };
  }, []);

  return (
    <div className="module-container">
      <h2>Notices</h2>
      <CreateNotice />
      <div className="notices-list">
        {notices && notices.map(notice => (
          <div key={notice._id} className="notice-item">
            <h3>{notice.title}</h3>
            <p>{notice.content}</p>
            <div className="notice-footer">
              <span className="notice-category">{notice.category}</span>
              <span className="notice-date">{new Date(notice.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notices;
