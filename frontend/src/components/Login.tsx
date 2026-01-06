import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';
import '../styles/Auth.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('onboarding_complete', 'true');
        navigate('/');
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

      {/* Logo Section */}
      <div className="auth-logo-section">
        <img
          src="/sylvie-logo.png"
          alt="Sylvie"
          className="auth-logo-image"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = document.createElement('h1');
            fallback.className = 'sylvie-title';
            fallback.textContent = 'Sylvie';
            e.currentTarget.parentElement?.appendChild(fallback);
          }}
        />
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
            <button onClick={() => setError('')} className="alert-close">
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleInputChange}
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>


          <div className="privacy-note">
            <strong>Your Privacy Matters</strong>
            <br />
            You can always choose to post anonymously, even with an account.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
