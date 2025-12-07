import { Link, useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="cs-landing-root">
      {/* Hero section: main heading + description + buttons (centered) */}
      <section className="cs-hero">
        <div className="cs-container">
          <div className="cs-hero-inner">
            <h1 className="cs-hero-title">
              Track Your Calories,
              <br />
              Achieve Your Goals
            </h1>

            <p className="cs-hero-subtitle">
              CalorieSync helps you monitor your daily calorie intake,
              providing insights to help you reach your target weight.
            </p>

            <div className="cs-hero-actions">
              <button
                className="cs-btn cs-btn-dark cs-btn-lg"
                onClick={() => nav('/register')}
              >
                Get Started Free
              </button>

              <button
                className="cs-btn cs-btn-outline cs-btn-lg"
                onClick={() => nav('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features section: three centered feature cards */}
      <section className="cs-section cs-section-features">
        <div className="cs-container">
          <h2 className="cs-section-title">Everything You Need to Succeed in your Journey</h2>

          <div className="cs-feature-grid">
            <div className="cs-feature-card">
              <div className="cs-feature-icon-badge cs-feature-icon-green">
                📊
              </div>
              <h3 className="cs-feature-title">Track Your Progress</h3>
              <p className="cs-feature-text">
                Visualize your calorie consumption with detailed
                weekly and monthly charts.
              </p>
            </div>

            <div className="cs-feature-card">
              <div className="cs-feature-icon-badge cs-feature-icon-blue">
                📝
              </div>
              <h3 className="cs-feature-title">Log Daily Activities</h3>
              <p className="cs-feature-text">
                Record your activities and track calories from
                daily routines.
              </p>
            </div>

            <div className="cs-feature-card">
              <div className="cs-feature-icon-badge cs-feature-icon-purple">
                🎯
              </div>
              <h3 className="cs-feature-title">Reach Your Goals</h3>
              <p className="cs-feature-text">
                Set your target weight and get real-time insights on how close
                you are to achieving it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section: large bottom gradient call-to-action */}
      <section className="cs-section cs-section-cta">
        <div className="cs-container cs-cta-inner">
          <h2 className="cs-cta-title">Ready to Start Your Journey?</h2>
          <p className="cs-cta-subtitle">
            Join CalorieSync today and take control of your nutrition and
            fitness goals.
          </p>

          <Link to="/register" className="cs-btn cs-btn-light">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer: dark background */}
      <footer className="cs-footer">
        © 2025 CalorieSync. All rights reserved.
      </footer>
    </div>
  );
}
