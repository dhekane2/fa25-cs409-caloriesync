import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/apiClient.js';

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
    height: '',       
    weight: '',
    goalWeight: '',
    goalTimeValue: '',
    goalTimeUnit: 'day',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      age,
      gender,
      height,
      weight,
      goalWeight,
      goalTimeValue,
      goalTimeUnit,
    } = form;

    // Required fields (phone is optional)
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !String(age).trim() ||
      !gender.trim() ||
      !String(height).trim() ||     
      !String(weight).trim() ||
      !String(goalWeight).trim() ||
      !String(goalTimeValue).trim()
    ) {
      setError('Please fill in all fields (except Phone Number).');
      return;
    }

    // Password match check
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // Map frontend fields to backend API contract
      const payload = {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_number: form.phone || '',
        age: Number(age),
        gender: gender.toLowerCase(),
        height: Number(height),
        weight: Number(weight),
        goal_weight: Number(goalWeight),
        goal_timeframe_value: Number(goalTimeValue),
        goal_timeframe_unit:
          goalTimeUnit === 'day'
            ? 'days'
            : goalTimeUnit === 'week'
            ? 'weeks'
            : 'months',
      };

      await apiClient.post('/auth/register', payload);

      nav('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Sign up failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cs-auth-wrapper">
      {/* Top logo & title section */}
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

          {/* Phone number (optional) */}
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

          {/* Height / Current weight */}
          <label className="cs-field">
            <span className="cs-field-label">Height (cm)</span>
            <input
              className="cs-input"
              type="number"
              min="100"
              max="250"
              value={form.height}
              onChange={(e) => update('height', e.target.value)}
              required
            />
          </label>

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

          {/* Goal weight (full row) */}
          <label className="cs-field cs-grid-2-span">
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
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
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
