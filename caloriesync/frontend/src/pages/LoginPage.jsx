import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);

      await apiClient.post(
        '/auth/login', 
        { email, password },
        { withCredentials: true }
      );
      
      nav('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-main-auth-bg">
      {/* Login-specific wrapper */}
      <div className="cs-login-wrapper">
        {/* Logo & title */}
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
            <button
              type="submit"
              className="cs-btn cs-btn-dark cs-btn-full"
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
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




