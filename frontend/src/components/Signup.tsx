import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Account created successfully - save user info and mark onboarding complete
        const userData = data.user || { username: formData.username, email: formData.email };
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('onboarding_complete', 'true');
        // Small delay to ensure session is set server-side
        setTimeout(() => navigate('/'), 100);
      } else if (response.status === 409 || data.message?.toLowerCase().includes('already exists')) {
        // Account already exists - redirect to login
        setError('Account already exists. Please sign in instead.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join the Brew community</p>
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
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>

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
              placeholder="Create a strong password"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <div className="form-check">
            <input
              type="checkbox"
              id="agreeToTerms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              required
            />
            <label htmlFor="agreeToTerms">
              I agree to the{' '}
              <Link to="/terms" className="auth-link">
                Terms & Conditions
              </Link>
            </label>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
          <p className="or-divider">OR</p>
          <Link to="/" className="btn-guest">
            Continue as Guest (Anonymous)
          </Link>

          <div className="privacy-note">
            <strong>🔒 Your Privacy is Protected</strong>
            <br />
            We never share your information. You can post anonymously anytime.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
