import { Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import TrackCaloriesPage from './pages/TrackCaloriesPage.jsx';
import './App.css';
import './index.css';

function Header() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  const isDashboardLike =
    location.pathname === '/dashboard' || location.pathname === '/track';

  // Do NOT show global header on Login / Register / Dashboard / Track
  if (isAuthPage || isDashboardLike) return null;

  // On landing only, keep the transparent-style header
  const headerClass =
    location.pathname === '/'
      ? 'cs-header cs-header-landing'
      : 'cs-header cs-header-simple';

  return (
    <header className={headerClass}>
      <div className="cs-container cs-header-inner">
        <Link to="/" className="cs-logo">
          <span className="cs-logo-icon">∿</span>
          <span className="cs-logo-text">CalorieSync</span>
        </Link>

        <div className="cs-header-actions">
          <Link to="/login" className="cs-btn cs-btn-outline">
            Login
          </Link>
          <Link to="/register" className="cs-btn cs-btn-dark">
            Register
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="cs-app-root">
      <Header />

      <main
        className={
          isAuthPage ? 'cs-main cs-main-auth-bg' : 'cs-main cs-main-default'
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/track" element={<TrackCaloriesPage />} />
        </Routes>
      </main>
    </div>
  );
}
