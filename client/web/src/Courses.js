import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from './context/AuthContext';

const ALL_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function Courses() {
  const { apiCall } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setError('');
      const response = await apiCall('/api/courses?limit=500');
      const data = await response.json();

      if (data.success) {
        const list = Array.isArray(data.data) ? data.data : [];
        const sorted = [...list].sort((a, b) => {
          if (a.semester !== b.semester) return a.semester - b.semester;
          return String(a.code || '').localeCompare(String(b.code || ''));
        });
        setCourses(sorted);
        setLastUpdated(new Date());
      } else {
        setError(data.message || 'Failed to load courses');
      }
    } catch {
      setError('Unable to fetch courses right now. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    const interval = setInterval(fetchCourses, 30000);
    return () => clearInterval(interval);
  }, [fetchCourses]);

  const groupedBySemester = useMemo(() => {
    const grouped = ALL_SEMESTERS.reduce((acc, sem) => {
      acc[sem] = [];
      return acc;
    }, {});

    courses.forEach((course) => {
      const sem = Number(course.semester);
      if (!Number.isNaN(sem) && grouped[sem]) {
        grouped[sem].push(course);
      }
    });

    return grouped;
  }, [courses]);

  const semestersToShow = selectedSemester === 'all'
    ? ALL_SEMESTERS
    : [Number(selectedSemester)];

  const renderCourseCard = (course) => (
    <div key={course._id} className="course-card">
      <div className="course-header">
        <h4>{course.name}</h4>
        <span className="course-code">{course.code}</span>
      </div>
      <div className="course-details">
        <p><strong>Credits:</strong> {course.credits}</p>
        <p><strong>Type:</strong> {course.type}</p>
        <p><strong>Faculty:</strong> {course.faculty?.name || 'Not Assigned'}</p>
        <p><strong>Room:</strong> {course.room || 'Not Assigned'}</p>
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading live courses...</div>;

  return (
    <div className="module-container courses-page">
      <div className="courses-page-header">
        <h2 className="futuristic-title">COURSE DIRECTORY</h2>
        <button className="action-button primary" onClick={fetchCourses}>
          Refresh Now
        </button>
      </div>

      <p className="courses-live-meta">
        Auto-refresh: every 30 seconds
        {lastUpdated && ` | Last updated: ${lastUpdated.toLocaleTimeString('en-IN')}`}
      </p>

      <div className="semester-filter-tabs">
        <button
          className={`semester-filter-btn ${selectedSemester === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedSemester('all')}
        >
          All Semesters ({courses.length})
        </button>
        {ALL_SEMESTERS.map((sem) => (
          <button
            key={sem}
            className={`semester-filter-btn ${selectedSemester === String(sem) ? 'active' : ''}`}
            onClick={() => setSelectedSemester(String(sem))}
          >
            Sem {sem} ({groupedBySemester[sem].length})
          </button>
        ))}
      </div>

      {error && (
        <div className="dashboard-section">
          <p className="empty-message">{error}</p>
        </div>
      )}

      {!error && semestersToShow.map((sem) => {
        const list = groupedBySemester[sem] || [];
        return (
          <div key={sem} className="dashboard-section">
            <div className="section-header">
              <h3>Semester {sem}</h3>
              <span className="course-count-chip">{list.length} courses</span>
            </div>

            {list.length === 0 ? (
              <div className="empty-message">No active courses found for this semester.</div>
            ) : (
              <div className="courses-grid">
                {list.map(renderCourseCard)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Courses;
