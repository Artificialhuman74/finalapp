import React, { useState, useEffect, useRef } from 'react';
import FloatingDecorations from './FloatingDecorations';
import GradualBlur from './GradualBlur';
import '../styles/Settings.css';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    phone: '',
    notifications: true,
    locationSharing: true,
    anonymousMode: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Check supported mime types for iOS compatibility
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure you are using HTTPS or localhost, or have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const saveRecording = async () => {
    if (!audioBlob) return;
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const res = await fetch('/api/upload-fake-call-audio', {
        method: 'POST',
        credentials: 'include', // Important for auth
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert('Recording saved successfully!');
      } else {
        alert('Failed to save recording');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving recording');
    }
  };

  // Load user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setProfile(prev => ({
          ...prev,
          username: user.username || '',
          email: user.email || ''
        }));
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      // Update local storage to reflect changes
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = { ...user, username: profile.username, email: profile.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      alert('Profile updated successfully!');
    }, 800);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <div className="settings-container">
      <FloatingDecorations />
      <GradualBlur position="bottom" height="11.475rem" strength={2.5} divCount={6} curve="ease-out" target="page" animated="scroll" />

      <div className="settings-header">
        <h1>⚙️ Settings</h1>
        <p>Manage your account and privacy preferences</p>
      </div>

      <div className="settings-content">
        {/* Profile Section */}
        <div className="settings-card">
          <h3>👤 Profile Information</h3>
          <form onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleProfileChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number (Optional)</label>
              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleProfileChange}
                placeholder="+1234567890"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}>
              Save Profile
            </button>
          </form>
        </div>

        {/* Fake Call Voice Section */}
        <div className="settings-card">
          <h3>🎙️ Fake Call Voice</h3>
          <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            Record a custom message to be played during the emergency fake call.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="btn"
                  style={{
                    background: '#EF4444',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>●</span> Record
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="btn"
                  style={{
                    background: '#374151',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>■</span> Stop
                </button>
              )}
            </div>

            {audioUrl && (
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <audio src={audioUrl} controls style={{ width: '100%' }} />
                <button
                  onClick={saveRecording}
                  className="btn btn-primary"
                  style={{ width: '100%', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                >
                  Save Recording
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="settings-card">
          <h3>🔒 Privacy & Safety</h3>
          <div className="settings-toggles">
            <div className="toggle-item">
              <div>
                <strong>Enable Notifications</strong>
                <p>Receive alerts for emergency updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="notifications"
                  checked={profile.notifications}
                  onChange={handleProfileChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <strong>Location Sharing</strong>
                <p>Allow sharing location during SOS</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="locationSharing"
                  checked={profile.locationSharing}
                  onChange={handleProfileChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="toggle-item">
              <div>
                <strong>Anonymous Mode</strong>
                <p>Post anonymously by default</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  name="anonymousMode"
                  checked={profile.anonymousMode}
                  onChange={handleProfileChange}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="settings-card">
          <h3>🔑 Change Password</h3>
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-warning" style={{ width: '100%' }}>
              Update Password
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-zone" style={{ borderColor: '#EF4444' }}>
          <h3 style={{ color: '#EF4444' }}>⚠️ Danger Zone</h3>
          <p>These actions cannot be undone</p>
          <div className="danger-actions">
            <button className="btn btn-outline-danger" style={{ flex: 1, borderColor: '#EF4444', color: '#EF4444' }}>
              Delete All Reports
            </button>
            <button className="btn btn-danger" style={{ flex: 1, background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
