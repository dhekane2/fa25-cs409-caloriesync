// src/pages/DashboardPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProfile as getProfile,
  updateProfile as saveProfile,
  fetchMonthlyStats as getMonthlyStats,
  fetchWeeklyStats as getWeeklyStats
} from "../services/dashboardApi.js";

import apiClient from '../services/apiClient.js';

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
import axios from 'axios';


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
  return 'Far from Goal';
}

/** accuracy vs dailyTarget, based on actual weekly points */
function computeDynamicAccuracy(profile, weekData) {
  const target = profile?.dailyTarget || 0;
  const points = weekData?.points || [];

  if (!target || !points.length) {
    return weekData.accuracy || 0;
  }

  const avgAbsDiff =
    points.reduce(
      (sum, p) => sum + Math.abs((p.actual ?? 0) - target),
      0,
    ) / points.length;

  const rawAcc = 100 - (avgAbsDiff / target) * 100;
  return Math.max(0, Math.min(100, Math.round(rawAcc)));
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

  // apiClient.get('/user/dummydashboard').then((res) => {
  //   console.log('Dashboard data:', res.data);
  // }).catch((err) => {
  //   console.error('Failed to fetch dashboard data:', err);
  // });

  useEffect(() => {
    async function load() {
      try {
        const p = await getProfile();

        const name = `${p.first_name || ''} ${p.last_name || ''}`.trim();

        const currentWeight = p.weight;
        const goalWeight = p.goal_weight;
        const goalTimeValue = p.goal_timeframe_value;

        const rawUnit = p.goal_timeframe_unit || 'months';
        const lowerUnit = rawUnit.toLowerCase();
        let goalTimeUnit = 'month';
        if (lowerUnit.startsWith('day')) goalTimeUnit = 'day';
        else if (lowerUnit.startsWith('week')) goalTimeUnit = 'week';

        const goalTimeframe = `${goalTimeValue} ${rawUnit}`;

        const dailyTarget = calculateDailyTargetCalories(
          currentWeight,
          goalWeight,
          goalTimeValue,
          goalTimeUnit,
          p.age,
          p.gender,
          p.height,
        );

        setProfile({
          ...p,
          name,
          currentWeight,
          goalWeight,
          goalTimeValue,
          goalTimeUnit,
          goalTimeframe,
          dailyTarget,
        });

        setProfileForm({
          name,
          email: p.email,
          phone: p.phone_number || '',
          age: p.age != null ? p.age.toString() : '',
          gender: p.gender || '',
          currentWeight:
            currentWeight != null ? currentWeight.toString() : '',
          goalWeight: goalWeight != null ? goalWeight.toString() : '',
          goalTimeValue:
            goalTimeValue != null ? goalTimeValue.toString() : '',
          goalTimeUnit,
        });
      } catch (e) {
        console.error(e);
      }
    }

    load();
  }, []);
    
  console.log("profile effect running");

  /* ---------- month  + week data ---------- */
  useEffect(() => {
    async function load() {
      try {
        const now = new Date();
        const base = new Date(
          now.getFullYear(),
          now.getMonth() + monthOffset,
        )
        const year = base.getFullYear();
        const month = base.getMonth() + 1; // 1-12

        const raw = await getMonthlyStats(year, month);

        const monthLabel = base.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });



        const days = (raw.days || []).map((d) => {
          const dateObj = new Date(d.date + "T00:00:00");
          return {
          key: d.date,
          inMonth: d.in_current_month,
          day: dateObj.getDate(),
          total: d.total_calories || 0,
        }
        });
        
        const total = days.reduce((sum, d) => sum + (d.total || 0), 0);

        setMonthData({monthLabel, total, days});
        console.log("monthly effect running");

      } catch(e){
        console.log(e)
      }
    }
    load()
  },[monthOffset])
  

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       console.log("weekly effect running");

  //       const w = await getWeeklyStats();
  //       setWeekData(w);
  //     } catch(e){}
  //   }
  //   load();
  // },[weekOffset])

  useEffect(() => {
    async function load() {
      try {
        const today = new Date();
        const start = new Date(today);

        // Use Monday as start of week; move back by weekOffset weeks
        const dayOfWeek = start.getDay(); // 0 = Sun ... 6 = Sat
        const diffToMonday = (dayOfWeek + 6) % 7;
        start.setDate(start.getDate() - diffToMonday - weekOffset * 7);

        const startDateStr = start.toISOString().slice(0, 10); // YYYY-MM-DD

        const raw = await getWeeklyStats(startDateStr);

        // raw: { week_start, week_end, days: [{ date, total_calories }] }
        const end = new Date(raw.week_end + "T00:00:00");
        const rangeLabel = `${start.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} – ${end.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;

        const expected = profile?.dailyTarget || 0;

        const points = (raw.days || []).map((d) => {
          const dateObj = new Date(d.date + "T00:00:00");
          return {
            day: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
            actual: d.total_calories || 0,
            expected,
          };
        });

        setWeekData({
          rangeLabel,
          accuracy: 0, // computeDynamicAccuracy will override based on points + profile
          points,
        });
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, [weekOffset, profile]);
  

  const handlePrevMonth = () => setMonthOffset((o) => o - 1);
  const handleNextMonth = () => setMonthOffset((o) => o + 1);

  const handlePrevWeek = () => setWeekOffset((o) => o + 1); // older
  const handleNextWeek = () =>
    setWeekOffset((o) => (o > 0 ? o - 1 : 0)); // don’t go into future

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      localStorage.removeItem('cs_token');
      nav('/login');
    }
  };

  const displayName = profile?.name || 'there';

  /* ---------- profile edit handlers ---------- */

  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleProfileSave = async () => {
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

  // Recalculate daily target using helper
  updated.dailyTarget = calculateDailyTargetCalories(
    updated.currentWeight,
    updated.goalWeight,
    updated.goalTimeValue,
    updated.goalTimeUnit,
    updated.age,
    updated.gender,
    updated.height,
  );

  // 1) Persist to backend
  try {
    const payload = {
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      age: updated.age,
      gender: updated.gender,
      height: updated.height,
      currentWeight: updated.currentWeight,
      goalWeight: updated.goalWeight,
      goalTimeValue: updated.goalTimeValue,
      goalTimeUnit: updated.goalTimeUnit,
    };

    const saved = await saveProfile(payload);

    // Re-normalize backend response into our profile shape
    const name = `${saved.first_name || ''} ${saved.last_name || ''}`.trim();
    const currentWeight = saved.weight;
    const goalWeight = saved.goal_weight;
    const goalTimeValue = saved.goal_timeframe_value;

    const rawUnit = saved.goal_timeframe_unit || 'months';
    const lowerUnit = rawUnit.toLowerCase();
    let goalTimeUnit = 'month';
    if (lowerUnit.startsWith('day')) goalTimeUnit = 'day';
    else if (lowerUnit.startsWith('week')) goalTimeUnit = 'week';

    const goalTimeframe = `${goalTimeValue} ${rawUnit}`;

    const dailyTarget = calculateDailyTargetCalories(
      currentWeight,
      goalWeight,
      goalTimeValue,
      goalTimeUnit,
      saved.age,
      saved.gender,
      saved.height,
    );

    const normalized = {
      ...saved,
      name,
      currentWeight,
      goalWeight,
      goalTimeValue,
      goalTimeUnit,
      goalTimeframe,
      dailyTarget,
    };

    setProfile(normalized);
    setIsEditingProfile(false);
  } catch (err) {
    console.error('Failed to update profile', err);
  }
};

  /* ---------- derived goal progress values ---------- */

  const goalTf = profile
    ? parseGoalTimeframe(profile.goalTimeframe)
    : { value: null, unit: null };

  const daysRemaining = getGoalDays(goalTf.value, goalTf.unit);
  const goalTimeLabel = profile?.goalTimeframe || '';

  // dynamic accuracy based on updated target + weekly data
  const accuracy = computeDynamicAccuracy(profile, weekData);
  const performanceLevel = getPerformanceLevel(accuracy);

  // recommendations + message based on performance
  let performanceMessage = "Not bad, but there's room for improvement.";
  let recos = [
    'Log meals consistently every day to improve your trend data.',
    'Double-check portions for your highest-calorie meals.',
    'Look for one snack per day you could replace with a lighter option.',
  ];

  if (performanceLevel === 'Excellent' || performanceLevel === 'Good') {
    performanceMessage = "Good job! You're on the right track.";
    recos = [
      "You're doing well! Small tweaks can improve accuracy further.",
      'Try meal prepping to better control portion sizes.',
      'Review days when you went over/under target to identify patterns.',
    ];
  } else if (performanceLevel === 'Far from Goal') {
    performanceMessage =
      "Don't get discouraged. Building healthy habits takes time!";
    recos = [
      "Don't get discouraged. Building healthy habits takes time!",
      'Start with small, achievable daily calorie targets.',
      'Track every meal and snack to understand your eating patterns.',
    ];
  }

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

      <div className="cs-container cs-dashboard-root">
        <div className="cs-dashboard-grid">
          <div className="cs-dashboard-left">

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
                    <label className="cs-field">
                      <span className="cs-profile-label">Name</span>
                      <input
                        className="cs-input"
                        value={profileForm.name}
                        onChange={(e) =>
                          handleProfileInputChange('name', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Email</span>
                      <input
                        className="cs-input"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) =>
                          handleProfileInputChange('email', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Phone</span>
                      <input
                        className="cs-input"
                        value={profileForm.phone}
                        onChange={(e) =>
                          handleProfileInputChange('phone', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Age</span>
                      <input
                        className="cs-input"
                        type="number"
                        min="1"
                        value={profileForm.age}
                        onChange={(e) =>
                          handleProfileInputChange('age', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Gender</span>
                      <select
                        className="cs-input"
                        value={profileForm.gender}
                        onChange={(e) =>
                          handleProfileInputChange('gender', e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Current Weight (kg)</span>
                      <input
                        className="cs-input"
                        type="number"
                        min="0"
                        value={profileForm.currentWeight}
                        onChange={(e) =>
                          handleProfileInputChange('currentWeight', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Goal Weight (kg)</span>
                      <input
                        className="cs-input"
                        type="number"
                        min="0"
                        value={profileForm.goalWeight}
                        onChange={(e) =>
                          handleProfileInputChange('goalWeight', e.target.value)
                        }
                      />
                    </label>

                    <label className="cs-field">
                      <span className="cs-profile-label">Goal Timeframe</span>
                      <div className="cs-goal-time-row">
                        <input
                          className="cs-input cs-goal-time-value"
                          type="number"
                          min="1"
                          value={profileForm.goalTimeValue}
                          onChange={(e) =>
                            handleProfileInputChange('goalTimeValue', e.target.value)
                          }
                        />
                        <select
                          className="cs-input cs-goal-time-unit"
                          value={profileForm.goalTimeUnit}
                          onChange={(e) =>
                            handleProfileInputChange('goalTimeUnit', e.target.value)
                          }
                        >
                          <option value="day">days</option>
                          <option value="week">weeks</option>
                          <option value="month">months</option>
                        </select>
                      </div>
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="cs-profile-grid">
                      <div><div className="cs-profile-label">Name</div>{profile?.name}</div>
                      <div><div className="cs-profile-label">Email</div>{profile?.email}</div>
                      <div><div className="cs-profile-label">Age</div>{profile?.age}</div>
                      <div><div className="cs-profile-label">Gender</div>{profile?.gender}</div>
                      <div><div className="cs-profile-label">Height</div>{profile?.height} cm</div>
                      <div><div className="cs-profile-label">Current Weight</div>{profile?.currentWeight} kg</div>
                      <div><div className="cs-profile-label">Goal Weight</div>{profile?.goalWeight} kg</div>
                      <div><div className="cs-profile-label">Goal Timeframe</div>{goalTimeLabel}</div>
                    </div>

                    <div className="cs-profile-target">
                      <div className="cs-profile-target-label">
                        Daily Target Calories
                      </div>
                      <div className="cs-profile-target-value">
                        {profile?.dailyTarget?.toLocaleString?.() || '--'} cal/day
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            <section className="cs-card cs-goal-card">
              <div className="cs-goal-header">
                <div className="cs-goal-header-icon">🎯</div>
                <h3>Goal Progress</h3>
              </div>

              <div className="cs-goal-box cs-goal-box-top">
                <div>
                  <div className="cs-goal-label">Days Remaining</div>
                  <div className="cs-goal-main-number">{daysRemaining ?? '--'}</div>
                </div>
                <div className="cs-goal-text-right">
                  <div className="cs-goal-label">Goal Timeframe</div>
                  <div className="cs-goal-text">{goalTimeLabel || '--'}</div>
                </div>
              </div>

              <div className="cs-goal-box">
                <div>
                  <div className="cs-goal-label">Current Accuracy</div>
                  <div className="cs-goal-main-number">{accuracy}%</div>
                </div>
                <div className="cs-goal-text-right">
                  <div className="cs-goal-label">Daily Target</div>
                  <div className="cs-goal-text">
                    {profile?.dailyTarget?.toLocaleString?.() || '--'} cal/day
                  </div>
                </div>
              </div>

              <div className="cs-goal-box cs-goal-box-bottom">
                <div>
                  <div className="cs-goal-label">Performance Level</div>
                  <div className="cs-goal-performance">{performanceLevel}</div>
                </div>
              </div>

              <div className="cs-goal-reco-header">
                <span className="cs-goal-reco-icon">💡</span>
                <span className="cs-goal-reco-title">Recommendations</span>
              </div>
              <ul className="cs-reco-list">
                {recos.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          </div>

          {/* RIGHT SIDE */}
          <div className="cs-dashboard-right">

            <section className="cs-card cs-calendar-card">
              <div className="cs-card-header-row cs-calendar-header">
                <div>
                  <h3>Monthly Calorie Intake</h3>
                  <p>Click any date to view or edit meals for that day</p>
                </div>
                <div>
                  <div className="cs-calendar-month">{monthData?.monthLabel || ''}</div>
                  <div className="cs-calendar-total">
                    <span>Total</span>
                    <div>{monthData?.total?.toLocaleString?.() || 0} cal</div>
                  </div>
                </div>
              </div>

              <div className="cs-calendar-nav">
                <button onClick={handlePrevMonth}>‹ Prev</button>
                <button onClick={handleNextMonth}>Next ›</button>
              </div>

              <CalendarGrid
                days={monthData?.days || []}
                onDayClick={handleDayClick}
              />
            </section>

            <section className="cs-card">
              <div className="cs-card-header-row cs-week-header">
                <h3>Weekly Calorie Trend</h3>
                <div className="cs-accuracy-score">{accuracy}%</div>
              </div>

              <div className="cs-week-nav-row">
                <button onClick={handlePrevWeek}>‹ Previous</button>
                <div>
                  {weekData?.rangeLabel || ''}
                </div>
                <button onClick={handleNextWeek} disabled={weekOffset === 0}>
                  Next ›
                </button>
              </div>

              <div className="cs-chart-wrapper">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={weekData?.points || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#16a34a" />
                    <Line type="monotone" dataKey="expected" stroke="#6366f1" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="cs-accuracy-message">{performanceMessage}</div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({ days = [], onDayClick }) {
  const weekday = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div>
      <div className="cs-calendar-weekdays">
        {weekday.map((w) => <div key={w}>{w}</div>)}
      </div>

      <div className="cs-calendar-grid">
        {days?.map((d) => (
          <div
            key={d?.key}
            className={'cs-calendar-cell ' + (d?.inMonth ? '' : 'cs-calendar-cell-out')}
            onClick={() => onDayClick?.(d)}
          >
            <div>{d?.day}</div>
            <div>{d?.total ? `${d.total} cal` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
