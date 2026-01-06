import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IntroOnboarding.css';

interface FeaturePermission {
  type: 'location' | 'notification' | 'microphone' | 'camera';
  granted: boolean;
}

const IntroOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    location: false,
    notification: false,
    microphone: false,
    camera: false
  });

  useEffect(() => {
    const onboardingComplete = localStorage.getItem('onboarding_complete');
    if (onboardingComplete === 'true') {
      navigate('/');
    }
  }, [navigate]);

  const features = [
    {
      id: 1,
      icon: '🚨',
      title: 'SOS Emergency Alert',
      description: 'One-tap emergency alerts with live GPS tracking',
      details: 'Instant alerts to emergency contacts via SMS and WhatsApp with real-time location tracking. Voice/video recording during emergencies.',
      permissions: ['location', 'notification'] as const
    },
    {
      id: 2,
      icon: '🗺️',
      title: 'Safe Routes',
      description: 'AI-powered route optimization for safer travel',
      details: 'Navigate with confidence using routes analyzed for crime density, street lighting, and population data.',
      permissions: ['location'] as const
    },
    {
      id: 3,
      icon: '📝',
      title: 'Incident Reporting',
      description: 'Document incidents with AI-powered summaries',
      details: 'Step-by-step guided reporting with evidence upload, AI summaries, and anonymous options.',
      permissions: ['camera'] as const
    },
    {
      id: 4,
      icon: '📞',
      title: 'AI Fake Call',
      description: 'Escape uncomfortable situations discreetly',
      details: 'AI-powered conversational fake calls with realistic responses to help you exit dangerous situations.',
      permissions: ['microphone'] as const
    },
    {
      id: 5,
      icon: '🤝',
      title: 'Community Support',
      description: 'Anonymous story sharing and peer support',
      details: 'Share experiences anonymously, get peer support, and access AI-powered emotional support anytime.',
      permissions: [] as const
    }
  ];

  const requestPermission = async (type: string) => {
    let granted = false;

    try {
      switch (type) {
        case 'location':
          granted = await new Promise<boolean>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              () => resolve(true),
              () => resolve(false)
            );
          });
          break;

        case 'notification':
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            granted = permission === 'granted';
          }
          break;

        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          } catch {
            granted = false;
          }
          break;

        case 'camera':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          } catch {
            granted = false;
          }
          break;
      }

      setPermissions(prev => ({ ...prev, [type]: granted }));
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
    }
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_complete', 'true');
    navigate('/login');
  };

  const getPermissionIcon = (type: string) => {
    const icons: Record<string, string> = {
      location: '📍',
      notification: '🔔',
      microphone: '🎤',
      camera: '📹'
    };
    return icons[type];
  };

  const getPermissionLabel = (type: string) => {
    const labels: Record<string, string> = {
      location: 'Location',
      notification: 'Notifications',
      microphone: 'Microphone',
      camera: 'Camera'
    };
    return labels[type];
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-simple">
        <div className="onboarding-logo">
          <img
            src="/sylvie-logo.png"
            alt="Sylvie"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        
        <h1 className="onboarding-welcome">Welcome to Sylvie</h1>
        <p className="onboarding-tagline">Your Personal Safety Companion</p>
        
        <div className="onboarding-features">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div 
                className="feature-card-header"
                onClick={() => setExpandedCard(expandedCard === feature.id ? null : feature.id)}
              >
                <div className="feature-card-left">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="feature-card-text">
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                  </div>
                </div>
                <span className={`expand-icon ${expandedCard === feature.id ? 'expanded' : ''}`}>
                  ›
                </span>
              </div>
              
              {expandedCard === feature.id && (
                <div className="feature-card-content">
                  <p className="feature-details">{feature.details}</p>
                  
                  {feature.permissions.length > 0 && (
                    <div className="permission-section">
                      <p className="permission-label">Required Permissions:</p>
                      <div className="permission-buttons">
                        {feature.permissions.map((perm) => (
                          <button
                            key={perm}
                            className={`permission-btn ${permissions[perm] ? 'granted' : ''}`}
                            onClick={() => requestPermission(perm)}
                            disabled={permissions[perm]}
                          >
                            <span className="perm-icon">
                              {permissions[perm] ? '✓' : getPermissionIcon(perm)}
                            </span>
                            <span className="perm-label">{getPermissionLabel(perm)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <button className="onboarding-start-btn" onClick={completeOnboarding}>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default IntroOnboarding;
