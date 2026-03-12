import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './DashboardLight.css';
import './AdditionalLightStyles.css';
import LoginDashboard from './LoginDashboard';
import Notices from './Notices';
import Students from './Students';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard from './AdminDashboard';
import Courses from './Courses';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Checking credentials...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;

  return children;
};

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <nav className="nav-bar">
      <Link to="/dashboard" className="nav-link">Dashboard</Link>
      <Link to="/notices" className="nav-link">Notices</Link>
      {user.role === 'student' && <Link to="/student" className="nav-link">Student Hub</Link>}
      {user.role === 'faculty' && <Link to="/faculty" className="nav-link">Faculty Hub</Link>}
      {user.role === 'admin' && <Link to="/admin" className="nav-link">Admin Hub</Link>}
      <Link to="/courses" className="nav-link">Courses</Link>
      <button onClick={handleLogout} className="logout-btn">DISCONNECT</button>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <header className="App-header">
            <h1>BIT CMS</h1>
            <Navigation />
          </header>
          <main className="main-content">
            <Routes>
              <Route path="/login" element={<LoginDashboard />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  {({ user }) => {
                    if (user?.role === 'admin') return <AdminDashboard />;
                    if (user?.role === 'faculty') return <FacultyDashboard />;
                    if (user?.role === 'student') return <Students />;
                    return <Navigate to="/login" />;
                  }}
                </PrivateRoute>
              } />
              <Route path="/notices" element={
                <PrivateRoute>
                  <Notices />
                </PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute>
                  <Courses />
                </PrivateRoute>
              } />
              
              {/* Role-specific routes */}
              <Route path="/student" element={
                <PrivateRoute roles={['student', 'admin']}>
                  <Students />
                </PrivateRoute>
              } />
              <Route path="/faculty" element={
                <PrivateRoute roles={['faculty', 'admin']}>
                  <FacultyDashboard />
                </PrivateRoute>
              } />
              <Route path="/admin" element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              {/* Redirect root to login */}
              <Route path="/" element={<Navigate to="/login" />} />
              
              {/* Catch all other routes */}
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
