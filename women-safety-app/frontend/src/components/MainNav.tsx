import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/MainNav.css';

const MainNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <span className="brand-icon">🛡️</span>
          <span className="brand-name">Sylvie</span>
        </Link>

        <div className="nav-links">
          <a 
            href="/sos-center" 
            className={`nav-link nav-link-emergency`}
          >
            <span className="nav-icon">🚨</span>
            <span>SOS</span>
          </a>

          <Link 
            to="/safe-routes" 
            className={`nav-link ${isActive('/safe-routes') ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            <span>Safe Routes</span>
          </Link>

          <a 
            href="/report" 
            className={`nav-link`}
          >
            <span className="nav-icon">📝</span>
            <span>Report</span>
          </a>

          <a 
            href="/community-support" 
            className={`nav-link`}
          >
            <span className="nav-icon">🤝</span>
            <span>Community</span>
          </a>

          <a 
            href="/fake-call-ai" 
            className={`nav-link`}
          >
            <span className="nav-icon">📞</span>
            <span>Fake Call</span>
          </a>

          <a 
            href="/my-reports" 
            className={`nav-link`}
          >
            <span className="nav-icon">📋</span>
            <span>My Reports</span>
          </a>

          <a 
            href="/settings" 
            className={`nav-link`}
          >
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </a>

          <a 
            href="/login" 
            className={`nav-link nav-link-login`}
          >
            <span className="nav-icon">👤</span>
            <span>Login</span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
