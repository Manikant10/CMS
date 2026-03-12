
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="futuristic-title">NEURAL ACCESS</h2>
        <p className="login-subtitle">Bhagwant Institute of Technology CMS</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>IDENTIFIER (EMAIL)</label>
            <input
              type="email"
              placeholder="user@bit.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label>SECURITY KEY (PASSWORD)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="futuristic-button login-btn" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'ESTABLISH LINK'}
          </button>
        </form>
        
        <div className="login-footer">
          <p>AUTHORIZED PERSONNEL ONLY</p>
          <div className="security-badges">
            <span className="badge">SSL v3.0</span>
            <span className="badge">256-BIT AES</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
