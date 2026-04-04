import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './DashboardLight.css';
import './AdditionalLightStyles.css';
import LoginDashboard from './LoginDashboard';
import Notices        from './Notices';
import Students       from './Students';
import FacultyDashboard from './FacultyDashboard';
import AdminDashboard   from './AdminDashboard';
import Courses          from './Courses';

// ─── Route guard ──────────────────────────────────────────────────────────────
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Checking credentials...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── Redirect /dashboard → role-specific page ─────────────────────────────────
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin')   return <Navigate to="/admin"   replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
};

// ─── Navigation bar ───────────────────────────────────────────────────────────
const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <nav className="nav-bar">
      <Link to="/dashboard" className="nav-link">Dashboard</Link>
      <Link to="/notices"   className="nav-link">Notices</Link>
      {user.role === 'student' && <Link to="/student" className="nav-link">Student Hub</Link>}
      {user.role === 'faculty' && <Link to="/faculty" className="nav-link">Faculty Hub</Link>}
      {user.role === 'admin'   && <Link to="/admin"   className="nav-link">Admin Hub</Link>}
      <Link to="/courses" className="nav-link">Courses</Link>
      <button onClick={() => logout(navigate)} className="logout-btn">DISCONNECT</button>
    </nav>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────
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

              {/* Smart redirect based on role */}
              <Route path="/dashboard" element={
                <PrivateRoute><DashboardRedirect /></PrivateRoute>
              } />

              {/* Shared routes */}
              <Route path="/notices" element={
                <PrivateRoute><Notices /></PrivateRoute>
              } />
              <Route path="/courses" element={
                <PrivateRoute><Courses /></PrivateRoute>
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

              <Route path="/"  element={<Navigate to="/login" replace />} />
              <Route path="*"  element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
