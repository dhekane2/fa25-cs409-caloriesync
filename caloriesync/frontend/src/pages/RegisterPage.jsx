import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { mockSignUp } from '../services/mockApi.js';
import { calculateDailyTargetCalories } from '../utils/calorieUtils.js';

export default function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: 'ian',
    email: 'ian@gmail.com',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '24',
    gender: 'Male',
    weight: '75',
    goalWeight: '70',
    goalTimeValue: '4',
    goalTimeUnit: 'month',
  });
  const [error, setError] = useState('');

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await mockSignUp(form);
      nav('/dashboard');
    } catch (err) {
      setError(err.message || 'Sign up failed');
    }
  };

  const canShowTarget =
    form.weight && form.goalWeight && form.goalTimeValue && form.goalTimeUnit;

  let dailyTarget = null;
  if (canShowTarget) {
    dailyTarget = calculateDailyTargetCalories(
      parseFloat(form.weight),
      parseFloat(form.goalWeight),
      parseFloat(form.goalTimeValue),
      form.goalTimeUnit,
      parseInt(form.age) || 25,
      form.gender === 'Male' ? 'male' : 'female',
    );
  }

  return (
    <div className="cs-auth-wrapper">
      <div className="cs-auth-card cs-auth-card-wide">
        <div className="cs-auth-logo">CalorieSync</div>
        <h1 className="cs-auth-title">Create Your Account</h1>
        <p className="cs-auth-subtitle">
          Start your journey to a healthier you
        </p>

        <form className="cs-grid-2" onSubmit={handleSubmit}>
          <label className="cs-field">
            <span className="cs-field-label">Full Name</span>
            <input
              className="cs-input"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
            />
          </label>
          <label className="cs-field">
            <span className="cs-field-label">Email</span>
            <input
              className="cs-input"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
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
          <label className="cs-field">
            <span className="cs-field-label">Confirm Password</span>
            <input
              className="cs-input"
              type="password"
              value={form.confirmPassword}
              onChange={(e) =>
                update('confirmPassword', e.target.value)
              }
              required
            />
          </label>

          <label className="cs-field">
            <span className="cs-field-label">Phone Number</span>
            <input
              className="cs-input"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </label>

          <div className="cs-grid-2-inner">
            <label className="cs-field">
              <span className="cs-field-label">Age (0–100)</span>
              <input
                className="cs-input"
                type="number"
                min="0"
                max="100"
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
              />
            </label>
            <label className="cs-field">
              <span className="cs-field-label">Gender</span>
              <select
                className="cs-input"
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </label>
          </div>

          <div className="cs-grid-2-inner">
            <label className="cs-field">
              <span className="cs-field-label">Current Weight (kg)</span>
              <input
                className="cs-input"
                type="number"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
              />
            </label>
            <label className="cs-field">
              <span className="cs-field-label">Goal Weight (kg)</span>
              <input
                className="cs-input"
                type="number"
                value={form.goalWeight}
                onChange={(e) => update('goalWeight', e.target.value)}
              />
            </label>
          </div>

          <div className="cs-field cs-grid-2-span">
            <span className="cs-field-label">Goal Timeframe</span>
            <div className="cs-goal-time-row">
              <input
                className="cs-input"
                type="number"
                min="0.5"
                step="0.5"
                value={form.goalTimeValue}
                onChange={(e) => update('goalTimeValue', e.target.value)}
              />
              <select
                className="cs-input cs-goal-time-unit"
                value={form.goalTimeUnit}
                onChange={(e) => update('goalTimeUnit', e.target.value)}
              >
                <option value="day">Day(s)</option>
                <option value="week">Week(s)</option>
                <option value="month">Month(s)</option>
              </select>
            </div>
            <p className="cs-help-text">
              How long do you plan to reach your goal weight?
            </p>
          </div>

          {dailyTarget && (
            <div className="cs-daily-target cs-grid-2-span">
              <h4>Your Daily Target</h4>
              <p>
                Based on your goal, you&apos;ll need to consume approximately{' '}
                <span className="cs-daily-target-strong">
                  {dailyTarget.toLocaleString()}
                </span>{' '}
                calories per day to reach {form.goalWeight} kg in{' '}
                {form.goalTimeValue} {form.goalTimeUnit}
                {parseFloat(form.goalTimeValue) !== 1 ? 's' : ''}.
              </p>
              <p className="cs-daily-target-note">
                💡 This calculation considers your current weight, age, gender,
                and assumes moderate activity.
              </p>
            </div>
          )}

          {error && (
            <p className="cs-error-text cs-grid-2-span">{error}</p>
          )}

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
