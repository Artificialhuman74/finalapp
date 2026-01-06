import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/SOSDeactivate.css';

const SOSDeactivate: React.FC = () => {
  const handleDeactivate = async () => {
    try {
      await fetch('/api/sos-deactivate', { method: 'POST' });
      alert('SOS deactivated successfully');
    } catch (err) {
      console.error('Failed to deactivate SOS:', err);
    }
  };

  return (
    <div className="sos-deactivate-container">
      <div className="deactivate-card">
        <div className="success-icon">✅</div>
        <h1>You're Safe!</h1>
        <p className="subtitle">We're glad you're okay. Let us know you're safe.</p>

        <div className="status-info">
          <div className="info-item">
            <span className="info-label">SOS Status</span>
            <span className="info-value active">🟢 Active</span>
          </div>
          <div className="info-item">
            <span className="info-label">Emergency Contacts Alerted</span>
            <span className="info-value">3 people</span>
          </div>
          <div className="info-item">
            <span className="info-label">Location Sharing</span>
            <span className="info-value">📍 Active</span>
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-success btn-lg" onClick={handleDeactivate}>
            ✓ Mark as Safe & Deactivate SOS
          </button>
          <Link to="/sos" className="btn btn-outline-primary">
            Keep SOS Active
          </Link>
        </div>

        <div className="help-text">
          <p>
            <strong>What happens when you mark as safe?</strong>
          </p>
          <ul>
            <li>Your emergency contacts will be notified you're safe</li>
            <li>Location sharing will stop</li>
            <li>SOS recording will be saved</li>
            <li>You can review the incident report later</li>
          </ul>
        </div>

        <div className="emergency-banner">
          <p>Still need help? Call emergency services:</p>
          <div className="emergency-buttons">
            <a href="tel:181" className="emergency-btn">
              📞 Women Helpline: 181
            </a>
            <a href="tel:100" className="emergency-btn">
              🚨 Police: 100
            </a>
            <a href="tel:108" className="emergency-btn">
              🏥 Ambulance: 108
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOSDeactivate;
