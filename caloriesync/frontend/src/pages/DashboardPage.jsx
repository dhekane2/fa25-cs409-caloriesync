import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMockProfile,
  getMockMonthlyCalendar,
  getMockWeeklyTrend,
} from '../services/mockApi.js';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [profile, setProfile] = useState(null);
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

  useEffect(() => {
    setProfile(getMockProfile());
    setMonthData(getMockMonthlyCalendar(monthOffset));
    setWeekData(getMockWeeklyTrend(0)); // current week
  }, [monthOffset]);

  const handlePrevMonth = () => setMonthOffset((o) => o - 1);
  const handleNextMonth = () => setMonthOffset((o) => o + 1);

  return (
    <div className="cs-dashboard-root cs-container">
      <div className="cs-dashboard-grid">
        {/* Left Side：Track calories shortcut + Profile + Goal Progress + Recommendations */}
        <div className="cs-dashboard-left">
          <section className="cs-card cs-card-track">
            <div className="cs-card-track-header">
              <div>
                <h2>Track Calories</h2>
                <p>Log your meals</p>
              </div>
              <Link to="/track" className="cs-btn cs-btn-light-outline">
                Go
              </Link>
            </div>
          </section>

          {profile && (
            <section className="cs-card">
              <div className="cs-card-header-row">
                <h3>Profile Information</h3>
                <button className="cs-btn cs-btn-sm cs-btn-outline">
                  Update
                </button>
              </div>
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
                  <div className="cs-profile-label">Current Weight</div>
                  <div>{profile.currentWeight} kg</div>
                </div>
                <div>
                  <div className="cs-profile-label">Goal Weight</div>
                  <div>{profile.goalWeight} kg</div>
                </div>
                <div>
                  <div className="cs-profile-label">Goal Timeframe</div>
                  <div>{profile.goalTimeframe}</div>
                </div>
              </div>
              <div className="cs-profile-target">
                Daily Target Calories&nbsp;
                <strong>{profile.dailyTarget.toLocaleString()} cal/day</strong>
              </div>
            </section>
          )}

          <section className="cs-card">
            <h3>Goal Progress</h3>
            <div className="cs-goal-progress-row">
              <div>
                <div className="cs-profile-label">Days Remaining</div>
                <div>0</div>
              </div>
              <div>
                <div className="cs-profile-label">Goal Timeframe</div>
                <div>4 weeks</div>
              </div>
            </div>
            <div className="cs-goal-progress-row">
              <div>
                <div className="cs-profile-label">Current Accuracy</div>
                <div>63%</div>
              </div>
              <div>
                <div className="cs-profile-label">Performance Level</div>
                <div>Needs Improvement</div>
              </div>
            </div>
          </section>

          <section className="cs-card">
            <h3>Recommendations</h3>
            <ul className="cs-reco-list">
              <li>Focus on planning meals ahead of time.</li>
              <li>Use measuring tools to ensure accurate portion sizes.</li>
              <li>
                Identify your trigger foods and find healthier alternatives.
              </li>
            </ul>
          </section>
        </div>

        {/* Right Side：Monthly calendar + weekly trend */}
        <div className="cs-dashboard-right">
          <section className="cs-card cs-calendar-card">
            <div className="cs-card-header-row cs-calendar-header">
              <div>
                <h3>Monthly Calorie Intake</h3>
                <p>Click any date to view or edit meals for that day</p>
              </div>
              <div className="cs-calendar-header-right">
                <div className="cs-calendar-month">
                  {monthData.monthLabel}
                </div>
                <div className="cs-calendar-total">
                  Total for Month:{' '}
                  <span>{monthData.total.toLocaleString()} cal</span>
                </div>
              </div>
            </div>

            <div className="cs-calendar-nav">
              <button
                className="cs-btn cs-btn-xs cs-btn-outline"
                onClick={handlePrevMonth}
              >
                Prev
              </button>
              <button
                className="cs-btn cs-btn-xs cs-btn-outline"
                onClick={handleNextMonth}
              >
                Next
              </button>
            </div>

            <CalendarGrid days={monthData.days} />
          </section>

          <section className="cs-card">
            <div className="cs-card-header-row">
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

            <p className="cs-week-range">{weekData.rangeLabel}</p>

            <div className="cs-chart-wrapper">
              <LineChart width={520} height={260} data={weekData.points}>
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
            </div>

            <div className="cs-accuracy-message">
              Not bad, but there&apos;s room for improvement.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function CalendarGrid({ days }) {
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
              'cs-calendar-cell ' + (d.inMonth ? '' : 'cs-calendar-cell-out')
            }
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

