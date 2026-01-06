import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import IntroOnboarding from './components/IntroOnboarding';
import Landing from './components/Landing';
import SafeRoutesApp from './components/SafeRoutesApp';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ClickSpark from './components/ClickSpark';
import Dock from './components/Dock';
import SOSCenter from './components/SOSCenter';
import CommunitySupport from './components/CommunitySupport';
import EmergencyContacts from './components/EmergencyContacts';
import FakeCall from './components/FakeCall';
import MyReports from './components/MyReports';
import IncidentReport from './components/IncidentReport';
import Login from './components/Login';
import Signup from './components/Signup';
import TipsPage from './components/TipsPage';
import SOSVideos from './components/SOSVideos';
import './App.css';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [shakeReady, setShakeReady] = React.useState(false);
  const lastShakeRef = React.useRef<number>(0);

  // Check if onboarding is complete
  const onboardingComplete = localStorage.getItem('onboarding_complete') === 'true';

  // Show dock only after onboarding
  const showDock = onboardingComplete && location.pathname !== '/intro';

  // Global Shake-to-SOS
  useEffect(() => {
    const threshold = 75;
    let lastX = 0, lastY = 0, lastZ = 0;

    const ensurePermission = async () => {
      if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
        try {
          const res = await (DeviceMotionEvent as any).requestPermission();
          if (res === 'granted') setShakeReady(true);
        } catch (e) {
          console.warn('Motion permission denied:', e);
        }
      } else {
        setShakeReady(true);
      }
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      if (!shakeReady) return;
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const { x, y, z } = acc;
      if (x === null || y === null || z === null) return;
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);
      const magnitude = deltaX + deltaY + deltaZ;
      lastX = x; lastY = y; lastZ = z;
      if (magnitude > threshold) {
        const now = Date.now();
        if (now - lastShakeRef.current > 4000) {
          lastShakeRef.current = now;
          navigate('/sos-center?trigger=true');
        }
      }
    };

    ensurePermission();
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [navigate, shakeReady]);

  return (
    <div className="App">
      <ClickSpark sparkColor="#f9d3e0">
        <Routes>
          <Route path="/intro" element={<IntroOnboarding />} />
          <Route path="/" element={onboardingComplete ? <Landing /> : <IntroOnboarding />} />
          <Route path="/safe-routes" element={<SafeRoutesApp />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/sos-center" element={<SOSCenter />} />
          <Route path="/community-support" element={<CommunitySupport />} />
          <Route path="/emergency-contacts" element={<EmergencyContacts />} />
          <Route path="/fake-call" element={<FakeCall />} />
          <Route path="/fake-call-ai" element={<FakeCall />} />
          <Route path="/incident-report" element={<IncidentReport />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/safety-tips" element={<TipsPage variant="safety" />} />
          <Route path="/sos-tips" element={<TipsPage variant="sos" />} />
          <Route path="/sos-videos" element={<SOSVideos />} />
        </Routes>
      </ClickSpark>

      {/* Global Dock - appears on all pages except intro/onboarding */}
      {showDock && (
        <Dock
          items={[
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
              ),
              label: 'Home',
              onClick: () => navigate('/')
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              ),
              label: 'Maps',
              onClick: () => navigate('/safe-routes')
            },
            {
              icon: <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '1px' }}>SOS</span>,
              label: 'SOS',
              onClick: () => navigate('/sos-center'),
              onLongPress: () => navigate('/sos-center?trigger=true'),
              className: 'sos-item'
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              ),
              label: 'Community',
              onClick: () => navigate('/community-support')
            },
            {
              icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1.01A11.36 11.36 0 0 1 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1zM19 12h2a9 9 0 0 0-9-9v2c3.87 0 7 3.13 7 7zm-4 0h2c1.66 0 3-1.34 3-3s-1.34-3-3-3v2c.55 0 1 .45 1 1s-.45 1-1 1z" />
                </svg>
              ),
              label: 'Fake Call',
              onClick: () => navigate('/fake-call-ai')
            }
          ]}
          spring={{ mass: 0.01, stiffness: 800, damping: 25 }}
          magnification={90}
          distance={120}
          panelHeight={75}
          baseItemSize={56}
        />
      )}
    </div>
  );
}

export default App;
