import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockSignUp } from '../services/mockApi.js';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: '',
    weight: '',
    goalWeight: '',
    goalTimeValue: '',
    // Provide a default unit to prevent empty string issue
    goalTimeUnit: 'day',
  });
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Extract fields for easier reading and validation
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      age,
      gender,
      weight,
      goalWeight,
      goalTimeValue,
      goalTimeUnit,
    } = form;

    // 1. Validate that all fields except phone are required
    //    (phone is optional and not validated)
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !String(age).trim() ||
      !gender.trim() ||
      !String(weight).trim() ||
      !String(goalWeight).trim() ||
      !String(goalTimeValue).trim()
      // No need to validate goalTimeUnit because default is "day"
    ) {
      setError('Please fill in all fields (except Phone Number).');
      return;
    }

    // 2. Password match check
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Include firstName and lastName into API submission
      await mockSignUp({
        ...form,
      });
      nav('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    }
  };

  return (
    <div className="cs-auth-wrapper">
      {/* Top logo + title section */}
      <div className="cs-register-header">
        <div className="cs-register-logo">
          <span className="cs-register-logo-mark">∿</span>
          <span>CalorieSync</span>
        </div>
        <h1 className="cs-register-title">Create Your Account</h1>
        <p className="cs-register-subtitle">
          Start your journey to a healthier you
        </p>
      </div>

      {/* White card container */}
      <div className="cs-auth-card cs-auth-card-wide">
        <form className="cs-grid-2" onSubmit={handleSubmit}>
          {/* First name / Last name */}
          <label className="cs-field">
            <span className="cs-field-label">First Name</span>
            <input
              className="cs-input"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder=""
              required
            />
          </label>

          <label className="cs-field">
            <span className="cs-field-label">Last Name</span>
            <input
              className="cs-input"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder=""
              required
            />
          </label>

          {/* Email / Password */}
          <label className="cs-field">
            <span className="cs-field-label">Email</span>
            <input
              className="cs-input"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder=""
              required
            />
          </label>

          <label className="cs-field">
            <span className="cs-field-label">Password</span>
            <input
              className="cs-input"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              required
            />
          </label>

          {/* Confirm Password */}
          <label className="cs-field cs-grid-2-span">
            <span className="cs-field-label">Confirm Password</span>
            <input
              className="cs-input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              required
            />
          </label>

          {/* Phone number (optional, no required) */}
          <label className="cs-field cs-grid-2-span">
            <span className="cs-field-label">Phone Number (Optional)</span>
            <input
              className="cs-input"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder=""
            />
          </label>

          {/* Age / Gender */}
          <label className="cs-field">
            <span className="cs-field-label">Age (0–100)</span>
            <input
              className="cs-input"
              type="number"
              min="0"
              max="100"
              value={form.age}
              onChange={(e) => update('age', e.target.value)}
              placeholder=""
              required
            />
          </label>

          <label className="cs-field">
            <span className="cs-field-label">Gender</span>
            <select
              className="cs-input"
              value={form.gender}
              onChange={(e) => update('gender', e.target.value)}
              required
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </label>

          {/* Current / Goal weight */}
          <label className="cs-field">
            <span className="cs-field-label">Current Weight (kg)</span>
            <input
              className="cs-input"
              type="number"
              value={form.weight}
              onChange={(e) => update('weight', e.target.value)}
              required
            />
          </label>

          <label className="cs-field">
            <span className="cs-field-label">Goal Weight (kg)</span>
            <input
              className="cs-input"
              type="number"
              value={form.goalWeight}
              onChange={(e) => update('goalWeight', e.target.value)}
              required
            />
          </label>

          {/* Goal timeframe */}
          <div className="cs-field cs-grid-2-span">
            <div className="cs-field-label cs-field-label-row">
              <span className="cs-field-label-icon">📅</span>
              <span>Goal Timeframe</span>
            </div>

            <div className="cs-goal-time-row">
              <input
                className="cs-input"
                type="number"
                min="0.5"
                step="0.5"
                value={form.goalTimeValue}
                onChange={(e) => update('goalTimeValue', e.target.value)}
                required
              />
              <select
                className="cs-input cs-goal-time-unit"
                value={form.goalTimeUnit}
                onChange={(e) => update('goalTimeUnit', e.target.value)}
                required
              >
                <option value="day">Day(s)</option>
                <option value="week">Week(s)</option>
                <option value="month">Month(s)</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && <p className="cs-error-text cs-grid-2-span">{error}</p>}

          {/* Submit button */}
          <button
            type="submit"
            className="cs-btn cs-btn-dark cs-btn-full cs-grid-2-span"
          >
            Create Account
          </button>
        </form>

        <p className="cs-auth-footer-text">
          Already have an account?{' '}
          <Link to="/login" className="cs-link-green">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
