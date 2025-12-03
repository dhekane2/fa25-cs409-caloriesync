// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockLogin } from '../services/mockApi.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await mockLogin({ email, password });
      nav('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    // Green background (same as Register)
    <div className="cs-main-auth-bg">
      {/* Login-specific wrapper, separate from Register */}
      <div className="cs-login-wrapper">
        {/* Logo + title (same visual as Register) */}
        <div className="cs-register-header">
          <div className="cs-register-logo">
            <span className="cs-register-logo-mark">∿</span>
            <span>CalorieSync</span>
          </div>
          <h1 className="cs-register-title">Welcome Back</h1>
          <p className="cs-register-subtitle">
            Log in to continue tracking your progress
          </p>
        </div>

        {/* Login-specific white card */}
        <div className="cs-login-card">
          <form className="cs-login-form" onSubmit={handleSubmit}>
            {/* Email */}
            <label className="cs-field">
              <span className="cs-field-label">Email</span>
              <input
                className="cs-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                required
              />
            </label>

            {/* Password */}
            <label className="cs-field">
              <span className="cs-field-label">Password</span>
              <input
                className="cs-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            {/* Error message */}
            {error && <p className="cs-error-text">{error}</p>}

            {/* Full-width button */}
            <button type="submit" className="cs-btn cs-btn-dark cs-btn-full">
              Log In
            </button>
          </form>

          {/* Footer text */}
          <p className="cs-auth-footer-text">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="cs-link-green">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}




