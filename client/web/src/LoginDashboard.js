import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './LoginDashboard.css';

function LoginDashboard() {
  const [loginType, setLoginType] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    rollNo: '',
    empId: '',
    semester: '',
    batch: '',
    phone: '',
    role: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setFormData({ ...formData, role: type });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Prevent admin registration
        if (loginType === 'admin') {
          setError('Admin registration is not allowed');
          setLoading(false);
          return;
        }
        
        // Registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        
        if (result.success) {
          setError('');
          if (result.requiresApproval) {
            // Show approval message and reset form
            alert(result.message || 'Registration submitted successfully. Please wait for admin approval.');
            setIsRegistering(false);
            setFormData({
              username: '',
              password: '',
              name: '',
              rollNo: '',
              empId: '',
              semester: '',
              batch: '',
              phone: '',
              role: loginType
            });
          } else {
            // Normal login after registration (for admin if allowed)
            const loginResult = await login(formData.username, formData.password, navigate);
            if (!loginResult.success) {
              setError(loginResult.message || 'Registration successful but login failed');
            }
          }
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        // Login
        const result = await login(formData.username, formData.password, navigate);
        if (!result.success) {
          setError(result.message || 'Authentication failed');
        }
        // Navigation is handled by the AuthContext
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderLoginForm = () => {
    const roleConfig = {
      admin: {
        title: 'ADMIN PORTAL',
        subtitle: 'System Administration',
        icon: '🔐',
        color: '#ff4444'
      },
      student: {
        title: 'STUDENT PORTAL',
        subtitle: 'Academic Portal',
        icon: '🎓',
        color: '#00aaff'
      },
      faculty: {
        title: 'FACULTY PORTAL',
        subtitle: 'Faculty Dashboard',
        icon: '👨‍🏫',
        color: '#44ff44'
      }
    };

    const config = roleConfig[loginType];

    return (
      <div className="login-form-container" style={{ borderColor: config.color }}>
        <div className="login-header">
          <span className="login-icon">{config.icon}</span>
          <h2 style={{ color: config.color }}>{config.title}</h2>
          <p>{config.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isRegistering ? (
            <>
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={`Enter your ${loginType} username`}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                />
              </div>
              
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                />
              </div>

              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  placeholder={`Enter your ${loginType} username`}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                />
              </div>

              {loginType === 'student' && (
                <>
                  <div className="input-group">
                    <label>Roll Number</label>
                    <input
                      type="text"
                      name="rollNo"
                      placeholder="Enter roll number"
                      value={formData.rollNo}
                      onChange={handleInputChange}
                      required
                      style={{ borderColor: config.color }}
                    />
                  </div>

                  <div className="input-row">
                    <div className="input-group">
                      <label>Semester</label>
                      <select
                        name="semester"
                        value={formData.semester}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: config.color }}
                      >
                        <option value="">Select</option>
                        {[1,2,3,4,5,6,7,8].map(sem => (
                          <option key={sem} value={sem}>Sem {sem}</option>
                        ))}
                      </select>
                    </div>

                    <div className="input-group">
                      <label>Batch</label>
                      <input
                        type="text"
                        name="batch"
                        placeholder="e.g., 2024-28"
                        value={formData.batch}
                        onChange={handleInputChange}
                        required
                        style={{ borderColor: config.color }}
                      />
                    </div>
                  </div>
                </>
              )}

              {loginType === 'faculty' && (
                <div className="input-group">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    name="empId"
                    placeholder="Enter employee ID"
                    value={formData.empId}
                    onChange={handleInputChange}
                    required
                    style={{ borderColor: config.color }}
                  />
                </div>
              )}

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ borderColor: config.color }}
                />
              </div>
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            style={{ backgroundColor: config.color }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
          </button>

          {loginType !== 'admin' && (
          <div className="form-toggle">
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="toggle-button"
              style={{ color: config.color }}
            >
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        )}
        </form>

              </div>
    );
  };

  return (
    <div className="login-dashboard">
      <div className="background-animation"></div>
      
      <div className="login-container">
        <header className="login-header-main">
          <h1 className="institution-title">
            <span className="bit">BIT</span>
            <span className="cms">CMS</span>
          </h1>
          <p className="institution-subtitle">Bhagwant Institute of Technology</p>
          <p className="institution-description">College Management System</p>
        </header>

        {!loginType ? (
          <div className="role-selection">
            <h2>Select Your Role</h2>
            <div className="role-cards">
              <div className="role-card admin"
                onClick={() => handleLoginTypeSelect('admin')}
              >
                <div className="role-icon">🔐</div>
                <h3>Administrator</h3>
                <p>System Management & Administration</p>
                <div className="role-features">
                  <span>User Management</span>
                  <span>System Settings</span>
                  <span>Reports & Analytics</span>
                </div>
              </div>

              <div
                className="role-card student"
                onClick={() => handleLoginTypeSelect('student')}
              >
                <div className="role-icon">🎓</div>
                <h3>Student</h3>
                <p>Academic Portal & Services</p>
                <div className="role-features">
                  <span>View Attendance</span>
                  <span>Access Resources</span>
                </div>
              </div>

              <div
                className="role-card faculty"
                onClick={() => handleLoginTypeSelect('faculty')}
              >
                <div className="role-icon">👨‍🏫</div>
                <h3>Faculty</h3>
                <p>Teaching & Faculty Services</p>
                <div className="role-features">
                  <span>Manage Classes</span>
                  <span>Track Attendance</span>
                  <span>Post Notices</span>
                </div>
              </div>
            </div>

            <div className="quick-info">
              <div className="info-card">
                <h4>📚 Academic Excellence</h4>
                <p>Comprehensive management for academic institutions</p>
              </div>
              <div className="info-card">
                <h4>🔒 Secure & Reliable</h4>
                <p>Enterprise-grade security for all your data</p>
              </div>
              <div className="info-card">
                <h4>📱 Anytime, Anywhere</h4>
                <p>Access your portal from any device, anywhere</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-form-wrapper">
            <button
              onClick={() => setLoginType('')}
              className="back-button"
            >
              ← Back to Role Selection
            </button>
            {renderLoginForm()}
          </div>
        )}
      </div>

      <footer className="login-footer">
        <p>&copy; 2024 Bhagwant Institute of Technology. All rights reserved.</p>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Help & Support</span>
        </div>
      </footer>
    </div>
  );
}

export default LoginDashboard;
