import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import apiConfig from './config/api';
import './LoginDashboard.css';

const STUDENT_DEPARTMENTS = [
  'Computer Science and Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Electrical Engineering',
  'Electronics and Communication Engineering',
  'Information Technology'
];

const EMPTY_FORM = {
  email: '',
  password: '',
  name: '',
  rollNo: '',
  empId: '',
  semester: '',
  section: '',
  batch: '',
  phone: '',
  role: ''
};

function LoginDashboard() {
  const [loginType, setLoginType] = useState('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginTypeSelect = (type) => {
    setLoginType(type);
    setFormData({ ...EMPTY_FORM, role: type });
    setIsRegistering(false);
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetRoleForm = (role) => {
    setFormData({ ...EMPTY_FORM, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        // Current requirement: only student self-registration.
        if (loginType !== 'student') {
          setError('Only student self-registration is enabled. Please contact admin.');
          setLoading(false);
          return;
        }

        const registerPayload = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: 'student',
          name: formData.name.trim(),
          rollNo: formData.rollNo.trim(),
          semester: Number(formData.semester),
          section: formData.section || 'A',
          batch: formData.batch.trim(),
          phone: formData.phone.trim()
        };

        const response = await fetch(apiConfig.endpoints.register, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registerPayload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          alert(result.message || 'Registration submitted successfully. Please wait for admin approval.');
          setIsRegistering(false);
          resetRoleForm(loginType);
        } else {
          setError(result.message || 'Registration failed');
        }
      } else {
        const result = await login(formData.email, formData.password, navigate);
        if (!result.success) {
          setError(result.message || 'Authentication failed');
        }
      }
    } catch {
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
        icon: 'ADM',
        color: '#ff4444'
      },
      student: {
        title: 'STUDENT PORTAL',
        subtitle: 'Academic Portal',
        icon: 'STD',
        color: '#00aaff'
      },
      faculty: {
        title: 'FACULTY PORTAL',
        subtitle: 'Faculty Dashboard',
        icon: 'FAC',
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder={`Enter your ${loginType} email`}
                  value={formData.email}
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
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
                  placeholder="Create a password (min 8 characters)"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength="8"
                  required
                  style={{ borderColor: config.color }}
                />
              </div>

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
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
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

              <div className="input-group">
                <label>Department</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  style={{ borderColor: config.color }}
                >
                  <option value="">Select Department</option>
                  {STUDENT_DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>{department}</option>
                  ))}
                </select>
              </div>

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
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Login')}
          </button>

          {loginType === 'student' && (
            <div className="form-toggle">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                }}
                className="toggle-button"
                style={{ color: config.color }}
              >
                {isRegistering
                  ? 'Already have an account? Login'
                  : 'New student? Create account (requires admin approval)'}
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
              <div
                className="role-card admin"
                onClick={() => handleLoginTypeSelect('admin')}
              >
                <div className="role-icon">ADM</div>
                <h3>Administrator</h3>
                <p>System Management and Administration</p>
                <div className="role-features">
                  <span>User Management</span>
                  <span>System Settings</span>
                  <span>Reports and Analytics</span>
                </div>
              </div>

              <div
                className="role-card student"
                onClick={() => handleLoginTypeSelect('student')}
              >
                <div className="role-icon">STD</div>
                <h3>Student</h3>
                <p>Academic Portal and Services</p>
                <div className="role-features">
                  <span>View Attendance</span>
                  <span>Access Resources</span>
                </div>
              </div>

              <div
                className="role-card faculty"
                onClick={() => handleLoginTypeSelect('faculty')}
              >
                <div className="role-icon">FAC</div>
                <h3>Faculty</h3>
                <p>Teaching and Faculty Services</p>
                <div className="role-features">
                  <span>Manage Classes</span>
                  <span>Track Attendance</span>
                  <span>Post Notices</span>
                </div>
              </div>
            </div>

            <div className="quick-info">
              <div className="info-card">
                <h4>Academic Excellence</h4>
                <p>Comprehensive management for academic institutions</p>
              </div>
              <div className="info-card">
                <h4>Secure and Reliable</h4>
                <p>Enterprise-grade security for all your data</p>
              </div>
              <div className="info-card">
                <h4>Anytime, Anywhere</h4>
                <p>Access your portal from any device, anywhere</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="login-form-wrapper">
            <button
              onClick={() => {
                setLoginType('');
                setIsRegistering(false);
                setError('');
                setFormData(EMPTY_FORM);
              }}
              className="back-button"
            >
              {'< Back to Role Selection'}
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
          <span>Help and Support</span>
        </div>
      </footer>
    </div>
  );
}

export default LoginDashboard;