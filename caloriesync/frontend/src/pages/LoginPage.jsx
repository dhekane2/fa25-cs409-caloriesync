import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockLogin } from '../services/mockApi.js';

export default function LoginPage() {
  const [email, setEmail] = useState('ian@gmail.com');
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
    <div className="cs-auth-wrapper">
      <div className="cs-auth-card">
        <div className="cs-auth-logo">CalorieSync</div>
        <h1 className="cs-auth-title">Welcome Back</h1>
        <p className="cs-auth-subtitle">
          Log in to continue tracking your progress
        </p>

        <form className="cs-form" onSubmit={handleSubmit}>
          <label className="cs-field">
            <span className="cs-field-label">Email</span>
            <input
              className="cs-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ian@gmail.com"
              required
            />
          </label>

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

          {error && <p className="cs-error-text">{error}</p>}

          <button type="submit" className="cs-btn cs-btn-dark cs-btn-full">
            Log In
          </button>
        </form>

        <p className="cs-auth-footer-text">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="cs-link-green">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

