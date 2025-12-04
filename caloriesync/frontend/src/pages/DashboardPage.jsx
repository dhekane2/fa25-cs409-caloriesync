import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMockProfile,
  getMockMonthlyCalendar,
  getMockWeeklyTrend,
} from '../services/mockApi.js';
import { calculateDailyTargetCalories } from '../utils/calorieUtils.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/* ---------- helpers for timeframe & goal progress ---------- */

function parseGoalTimeframe(str) {
  if (!str) return { value: 4, unit: 'month' }; // default
  const [rawValue, rawUnit = 'month'] = str.split(' ');
  const value = Number(rawValue) || 4;
  const u = rawUnit.toLowerCase();
  if (u.startsWith('day')) return { value, unit: 'day' };
  if (u.startsWith('week')) return { value, unit: 'week' };
  return { value, unit: 'month' };
}

function getGoalDays(value, unit) {
  const v = Number(value);
  if (!v) return null;
  switch (unit) {
    case 'day':
    case 'days':
      return v;
    case 'week':
    case 'weeks':
      return v * 7;
    case 'month':
    case 'months':
    default:
      return v * 30;
  }
}

function getPerformanceLevel(accuracy) {
  if (accuracy >= 90) return 'Excellent';
  if (accuracy >= 75) return 'Good';
  if (accuracy >= 60) return 'Needs Improvement';
  return 'Far from goal';
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [monthData, setMonthData] = useState({
    monthLabel: '',
    total: 0,
    days: [],
  });

  const [weekData, setWeekData] = useState({
    rangeLabel: '',
    accuracy: 63,
    points: [],
  });

  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  const nav = useNavigate();

  /* ---------- load profile once on mount ---------- */
  useEffect(() => {
    const p = getMockProfile();

    const { value: tfValue, unit: tfUnit } = parseGoalTimeframe(
      p.goalTimeframe,
    );

    setProfile({
      ...p,
      goalTimeValue: tfValue,
      goalTimeUnit: tfUnit,
      phone: p.phone || '',
    });

    setProfileForm({
      name: p.name || '',
      email: p.email || '',
      phone: p.phone || '',
      age: p.age?.toString() || '',
      gender: p.gender || 'Female',
      currentWeight: p.currentWeight?.toString() || '',
      goalWeight: p.goalWeight?.toString() || '',
      goalTimeValue: tfValue?.toString() || '',
      goalTimeUnit: tfUnit || 'month',
    });
  }, []);

  /* ---------- month + week data ---------- */
  useEffect(() => {
    setMonthData(getMockMonthlyCalendar(monthOffset));
  }, [monthOffset]);

  useEffect(() => {
    setWeekData(getMockWeeklyTrend(weekOffset));
  }, [weekOffset]);

  const handlePrevMonth = () => setMonthOffset((o) => o - 1);
  const handleNextMonth = () => setMonthOffset((o) => o + 1);

  const handlePrevWeek = () => setWeekOffset((o) => o + 1); // older
  const handleNextWeek = () =>
    setWeekOffset((o) => (o > 0 ? o - 1 : 0)); // don’t go into future

  const handleLogout = () => {
    localStorage.removeItem('cs_token');
    nav('/login');
  };

  const displayName = profile?.name || 'there';

  /* ---------- profile edit handlers ---------- */

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileSave = () => {
    if (!profile || !profileForm) return;

    const goalTimeValueNum = parseFloat(profileForm.goalTimeValue) || 0;
    const goalTimeUnit = profileForm.goalTimeUnit || 'month';

    const updated = {
      ...profile,
      name: profileForm.name.trim() || profile.name,
      email: profileForm.email.trim() || profile.email,
      phone: profileForm.phone.trim(),
      age: Number(profileForm.age) || profile.age,
      gender: profileForm.gender || profile.gender,
      currentWeight:
        Number(profileForm.currentWeight) || profile.currentWeight,
      goalWeight: Number(profileForm.goalWeight) || profile.goalWeight,
      goalTimeValue: goalTimeValueNum || profile.goalTimeValue,
      goalTimeUnit,
    };

    if (updated.goalTimeValue && updated.goalTimeUnit) {
      const unitLabel =
        updated.goalTimeUnit === 'day'
          ? 'days'
          : updated.goalTimeUnit === 'week'
          ? 'weeks'
          : 'months';
      updated.goalTimeframe = `${updated.goalTimeValue} ${unitLabel}`;
    }

    // recalc daily target using helper
    updated.dailyTarget = calculateDailyTargetCalories(
      updated.currentWeight,
      updated.goalWeight,
      updated.goalTimeValue,
      updated.goalTimeUnit,
      updated.age,
      updated.gender,
      updated.height,
    );

    setProfile(updated);
    setIsEditingProfile(false);
  };

  /* ---------- derived goal progress values ---------- */

  const goalTf = profile
    ? parseGoalTimeframe(profile.goalTimeframe)
    : { value: null, unit: null };

  const daysRemaining = getGoalDays(goalTf.value, goalTf.unit);
  const goalTimeLabel = profile?.goalTimeframe || '';

  const performanceLevel = getPerformanceLevel(weekData.accuracy || 0);

  /* ---------- calendar → track navigation ---------- */

  const handleDayClick = (dayObj) => {
    if (!dayObj?.key) return;
    nav(`/track?date=${dayObj.key}`);
  };

  return (
    <div className="cs-dashboard-screen">
      <header className="cs-dashboard-header">
        <div className="cs-container cs-dashboard-header-inner">
          <div className="cs-dashboard-brand">
            <span className="cs-logo-icon">∿</span>
            <span className="cs-dashboard-brand-text">CalorieSync</span>
          </div>
          <div className="cs-dashboard-header-right">
            <span className="cs-dashboard-welcome">
              Welcome, <strong>{displayName}</strong>
            </span>
            <button
              type="button"
              className="cs-btn cs-btn-outline cs-btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <div className="cs-container cs-dashboard-root">
        <div className="cs-dashboard-grid">
          {/* Left Side: Track calories shortcut + Profile + Goal Progress + Recommendations */}
          <div className="cs-dashboard-left">
            {/* Track Calories gradient card */}
            <section
              className="cs-card cs-card-track cs-card-track-lg cs-card-track-primary"
              onClick={() => nav('/track')}
            >
              <div className="cs-card-track-header cs-card-track-main">
                <div className="cs-card-track-icon">＋</div>
                <div>
                  <h2 className="cs-card-track-title">Track Calories</h2>
                  <p className="cs-card-track-text">Log your meals</p>
                </div>
              </div>
            </section>

            {/* Profile card */}
            {profile && profileForm && (
              <section className="cs-card cs-profile-card">
                <div className="cs-card-header-row">
                  <h3>Profile Information</h3>
                  <button
                    className="cs-btn cs-btn-sm cs-btn-outline"
                    type="button"
                    onClick={
                      isEditingProfile
                        ? handleProfileSave
                        : () => setIsEditingProfile(true)
                    }
                  >
                    {isEditingProfile ? 'Save' : 'Update'}
                  </button>
                </div>

                {/* EDIT MODE */}
                {isEditingProfile ? (
                  <div className="cs-profile-edit-grid">
                    <label className="cs-field cs-profile-field-full">
                      <span className="cs-field-label">Name</span>
                      <input
                        className="cs-input"
                        value={profileForm.name}
                        onChange={(e) =>
                          handleProfileInputChange('name', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field cs-profile-field-full">
                      <span className="cs-field-label">Email</span>
                      <input
                        className="cs-input"
                        value={profileForm.email}
                        disabled
                      />
                    </label>

                    <label className="cs-field cs-profile-field-full">
                      <span className="cs-field-label">Phone</span>
                      <input
                        className="cs-input"
                        value={profileForm.phone}
                        onChange={(e) =>
                          handleProfileInputChange('phone', e.target.value)
                        }
                      />
                    </label>

                    <div className="cs-profile-two-col">
                      <label className="cs-field">
                        <span className="cs-field-label">Age</span>
                        <input
                          className="cs-input"
                          type="number"
                          value={profileForm.age}
                          onChange={(e) =>
                            handleProfileInputChange('age', e.target.value)
                          }
                        />
                      </label>

                      <label className="cs-field">
                        <span className="cs-field-label">Gender</span>
                        <select
                          className="cs-input"
                          value={profileForm.gender}
                          onChange={(e) =>
                            handleProfileInputChange('gender', e.target.value)
                          }
                        >
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                        </select>
                      </label>
                    </div>

                    <div className="cs-profile-two-col">
                      <label className="cs-field">
                        <span className="cs-field-label">Weight (kg)</span>
                        <input
                          className="cs-input"
                          type="number"
                          value={profileForm.currentWeight}
                          onChange={(e) =>
                            handleProfileInputChange(
                              'currentWeight',
                              e.target.value,
                            )
                          }
                        />
                      </label>

                      <label className="cs-field">
                        <span className="cs-field-label">Goal (kg)</span>
                        <input
                          className="cs-input"
                          type="number"
                          value={profileForm.goalWeight}
                          onChange={(e) =>
                            handleProfileInputChange(
                              'goalWeight',
                              e.target.value,
                            )
                          }
                        />
                      </label>
                    </div>

                    <div className="cs-profile-two-col">
                      <label className="cs-field">
                        <span className="cs-field-label">Goal Timeframe</span>
                        <input
                          className="cs-input"
                          type="number"
                          min="0.5"
                          step="0.5"
                          value={profileForm.goalTimeValue}
                          onChange={(e) =>
                            handleProfileInputChange(
                              'goalTimeValue',
                              e.target.value,
                            )
                          }
                        />
                      </label>
                      <label className="cs-field">
                        <span className="cs-field-label">&nbsp;</span>
                        <select
                          className="cs-input"
                          value={profileForm.goalTimeUnit}
                          onChange={(e) =>
                            handleProfileInputChange(
                              'goalTimeUnit',
                              e.target.value,
                            )
                          }
                        >
                          <option value="day">Day(s)</option>
                          <option value="week">Week(s)</option>
                          <option value="month">Month(s)</option>
                        </select>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE (what you had, but using updated goal info) */
                  <>
                    <div className="cs-profile-grid">
                      <div>
                        <div className="cs-profile-label">Name</div>
                        <div>{profile.name}</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Email</div>
                        <div className="cs-link-green">{profile.email}</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Age</div>
                        <div>{profile.age}</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Gender</div>
                        <div>{profile.gender}</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Height</div>
                        <div>{profile.height} cm</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Current Weight</div>
                        <div>{profile.currentWeight} kg</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Goal Weight</div>
                        <div>{profile.goalWeight} kg</div>
                      </div>
                      <div>
                        <div className="cs-profile-label">Goal Timeframe</div>
                        <div>{goalTimeLabel}</div>
                      </div>
                    </div>
                    <div className="cs-profile-target">
                      <div className="cs-profile-target-label">
                        Daily Target Calories
                      </div>
                      <div className="cs-profile-target-value">
                        {profile.dailyTarget.toLocaleString()} cal/day
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {/* Goal progress card */}
            <section className="cs-card cs-goal-card">
              <h3>Goal Progress</h3>

              <div className="cs-goal-progress-row cs-goal-row-highlight">
                <div>
                  <div className="cs-profile-label">Days Remaining</div>
                  <div className="cs-goal-number">
                    {daysRemaining ?? '--'}
                  </div>
                </div>
                <div className="cs-goal-text-right">
                  <div className="cs-profile-label">Goal Timeframe</div>
                  <div>{goalTimeLabel || '--'}</div>
                </div>
              </div>

              <div className="cs-goal-progress-row">
                <div>
                  <div className="cs-profile-label">Current Accuracy</div>
                  <div className="cs-goal-number">
                    {weekData.accuracy}%
                  </div>
                </div>
                <div className="cs-goal-text-right">
                  <div className="cs-profile-label">Performance Level</div>
                  <div>{performanceLevel}</div>
                </div>
              </div>

              <div className="cs-goal-badge">
                Keep logging consistently to improve your accuracy.
              </div>
            </section>

            {/* Recommendations card */}
            <section className="cs-card cs-reco-card">
              <h3>Recommendations</h3>
              <ul className="cs-reco-list">
                <li>Focus on planning meals ahead of time.</li>
                <li>Use measuring tools to ensure accurate portion sizes.</li>
                <li>
                  Identify your trigger foods and find healthier
                  alternatives.
                </li>
              </ul>
            </section>
          </div>

          {/* Right Side: Monthly calendar + weekly trend */}
          <div className="cs-dashboard-right">
            {/* Calendar */}
            <section className="cs-card cs-calendar-card">
              <div className="cs-card-header-row cs-calendar-header">
                <div>
                  <h3>Monthly Calorie Intake</h3>
                  <p className="cs-card-subtitle">
                    Click any date to view or edit meals for that day
                  </p>
                </div>
                <div className="cs-calendar-header-right">
                  <div className="cs-calendar-month">
                    {monthData.monthLabel}
                  </div>
                  <div className="cs-calendar-total">
                    <span className="cs-profile-label">Total for Month</span>
                    <div>
                      <span>{monthData.total.toLocaleString()} cal</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cs-calendar-nav">
                <button
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  onClick={handlePrevMonth}
                >
                  ‹ Prev
                </button>
                <button
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  onClick={handleNextMonth}
                >
                  Next ›
                </button>
              </div>

              <CalendarGrid days={monthData.days} onDayClick={handleDayClick} />
            </section>

            {/* Weekly chart */}
            <section className="cs-card">
              <div className="cs-card-header-row cs-week-header">
                <div>
                  <h3>Weekly Calorie Trend</h3>
                  <p className="cs-card-subtitle">
                    Actual vs Expected Daily Intake
                  </p>
                </div>
                <div className="cs-accuracy">
                  <span className="cs-profile-label">Accuracy Score</span>
                  <span className="cs-accuracy-score">
                    {weekData.accuracy}%
                  </span>
                </div>
              </div>

              {/* New week nav row */}
              <div className="cs-week-nav-row">
                <button
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  type="button"
                  onClick={handlePrevWeek}
                >
                  ‹ Previous
                </button>

                <div className="cs-week-range-block">
                  <div className="cs-week-range-main">
                    {weekData.rangeLabel}
                  </div>
                  <div className="cs-week-range-tag">
                    {weekOffset === 0
                      ? 'Current Week'
                      : `${weekOffset} week${weekOffset > 1 ? 's' : ''} ago`}
                  </div>
                </div>

                <button
                  className="cs-btn cs-btn-xs cs-btn-outline"
                  type="button"
                  onClick={handleNextWeek}
                  disabled={weekOffset === 0}
                >
                  Next ›
                </button>
              </div>

              <div className="cs-chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={weekData.points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      name="Actual Intake"
                      stroke="#16a34a"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="expected"
                      name="Expected Intake"
                      stroke="#6366f1"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="cs-accuracy-message cs-accuracy-message-good">
                {weekData.accuracy >= 75
                  ? "Good job! You're on the right track."
                  : "Not bad, but there's room for improvement."}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Calendar grid with clickable days */
function CalendarGrid({ days, onDayClick }) {
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      <div className="cs-calendar-weekdays">
        {weekday.map((w) => (
          <div key={w} className="cs-calendar-weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="cs-calendar-grid">
        {days.map((d) => (
          <div
            key={d.key}
            className={
              'cs-calendar-cell ' +
              (d.inMonth ? '' : 'cs-calendar-cell-out')
            }
            onClick={() => onDayClick && onDayClick(d)}
          >
            <div className="cs-calendar-cell-day">{d.day}</div>
            <div className="cs-calendar-cell-cal">
              {d.total ? `${d.total} cal` : ''}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
