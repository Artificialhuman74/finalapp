import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAppContext } from '../context/AppContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useVoiceGuidance } from '../hooks/useVoiceGuidance';
import FeedbackModal from './FeedbackModal';

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const NavigationView: React.FC = () => {
  const { selectedRoute, setIsNavigating, setSelectedRoute } = useAppContext();
  const { position, accuracy } = useGeolocation(true);
  const { speak } = useVoiceGuidance();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [hasArrived, setHasArrived] = useState(false);
  const [heading, setHeading] = useState(0);
  const [currentDirection, setCurrentDirection] = useState('⬆️');
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]);
  const [nextStreet, setNextStreet] = useState('Ring Rd / Outer Ring Rd');
  const [currentStreet, setCurrentStreet] = useState('Kengeri Ring Rd');
  const [needsPermission, setNeedsPermission] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Create user location icon as a triangle that rotates with heading
  const createUserIcon = (heading: number) => {
    return new L.DivIcon({
      html: `
        <div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <!-- Outer glow -->
            <circle cx="20" cy="20" r="18" fill="rgba(59, 130, 246, 0.2)" />
            <!-- Triangle pointing up (will rotate with heading) -->
            <path d="M 20 8 L 28 28 L 20 24 L 12 28 Z" fill="#3b82f6" stroke="white" stroke-width="2"/>
          </svg>
        </div>
      `,
      className: 'user-location-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  // Request device orientation permission and setup listener
  useEffect(() => {
    const requestOrientationPermission = async () => {
      // For iOS 13+ devices, we need to request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setNeedsPermission(true);
      } else {
        // For non-iOS or older iOS devices
        setupOrientationListener();
      }
    };

    const setupOrientationListener = () => {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          // event.alpha gives compass heading (0-360)
          // We need to invert it for proper rotation
          const compassHeading = 360 - event.alpha;
          setHeading(compassHeading);
        }
        // Check for iOS webkitCompassHeading (cast to any to avoid TypeScript error)
        const eventAny = event as any;
        if (eventAny.webkitCompassHeading !== undefined) {
          // iOS provides webkitCompassHeading which is more accurate
          setHeading(eventAny.webkitCompassHeading);
        }
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
      window.addEventListener('deviceorientation', handleOrientation);

      return () => {
        window.removeEventListener('deviceorientationabsolute', handleOrientation as any, true);
        window.removeEventListener('deviceorientation', handleOrientation);
      };
    };

    requestOrientationPermission();
  }, []);

  const getTurnIcon = useCallback((direction: string) => {
    if (direction.includes('left')) return '↰';
    if (direction.includes('right')) return '↱';
    if (direction.includes('straight')) return '⮝';
    return '⮝';
  }, []);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    const bearing = ((θ * 180) / Math.PI + 360) % 360;

    return bearing;
  };

  useEffect(() => {
    if (!position || !selectedRoute) return;

    const currentLat = position.coords.latitude;
    const currentLon = position.coords.longitude;
    setMapCenter([currentLat, currentLon]);

    const lastPoint = selectedRoute.route[selectedRoute.route.length - 1];
    const distToEnd = calculateDistance(currentLat, currentLon, lastPoint[0], lastPoint[1]);

    if (distToEnd < 50 && !hasArrived) {
      setHasArrived(true);
      speak('You have arrived at your destination!', 'high');
      setTimeout(() => setShowFeedback(true), 1000);
      return;
    }

    let minDist = Infinity;
    let closestIdx = currentStepIndex;

    for (let i = currentStepIndex; i < selectedRoute.route.length; i++) {
      const [lat, lon] = selectedRoute.route[i];
      const dist = calculateDistance(currentLat, currentLon, lat, lon);

      if (dist < minDist) {
        minDist = dist;
        closestIdx = i;
      }
    }

    if (closestIdx !== currentStepIndex && closestIdx > currentStepIndex) {
      setCurrentStepIndex(closestIdx);
    }

    if (closestIdx < selectedRoute.route.length - 1) {
      const nextPoint = selectedRoute.route[closestIdx + 1];
      const dist = calculateDistance(currentLat, currentLon, nextPoint[0], nextPoint[1]);
      setDistanceToNext(dist);
    }
  }, [position, selectedRoute, currentStepIndex, hasArrived, speak]);

  const handleExit = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  const handleRecenter = () => {
    if (position) {
      setMapCenter([position.coords.latitude, position.coords.longitude]);
    }
  };

  const handleRequestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          setNeedsPermission(false);
          // Setup listener manually since useEffect won't run again
          const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
              const compassHeading = 360 - event.alpha;
              setHeading(compassHeading);
            }
            const eventAny = event as any;
            if (eventAny.webkitCompassHeading !== undefined) {
              setHeading(eventAny.webkitCompassHeading);
            }
          };
          window.addEventListener('deviceorientationabsolute', handleOrientation as any, true);
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          console.warn('Device orientation permission denied');
        }
      } catch (error) {
        console.error('Error requesting device orientation permission:', error);
      }
    }
  };

  if (!selectedRoute) return null;

  const progress = (currentStepIndex / selectedRoute.route.length) * 100;

  return (
    <div className="google-nav-container">
      {/* Permission request button for iOS */}
      {needsPermission && !permissionGranted && (
        <div className="permission-banner">
          <div className="permission-message">
            📍 Enable compass to see your direction
          </div>
          <button className="permission-btn" onClick={handleRequestPermission}>
            Enable
          </button>
        </div>
      )}

      {/* Top instruction card */}
      <div className="google-nav-instruction-card">
        <div className="instruction-left">
          <div className="turn-icon">↰</div>
          <div className="turn-distance">
            {distanceToNext < 1000
              ? `${Math.round(distanceToNext)}m`
              : `${(distanceToNext / 1000).toFixed(1)}km`}
          </div>
        </div>
        <div className="instruction-text">
          <div className="street-primary">{currentStreet}</div>
          <div className="street-secondary">{nextStreet}</div>
        </div>
        <button className="compass-button">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="#4285f4" />
            <path d="M12 8 L12 16 M12 8 L8 12 M12 8 L16 12" stroke="white" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Then instruction (if applicable) */}
      <div className="google-nav-then">
        <div className="then-icon">↱</div>
        <div className="then-text">Then</div>
      </div>

      {/* Map */}
      <div className="google-nav-map">
        <MapContainer
          center={mapCenter}
          zoom={18}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <MapUpdater center={mapCenter} zoom={18} />

          <Polyline
            positions={selectedRoute.route.map(p => [p[0], p[1]])}
            color="#7C3AED"
            weight={8}
            opacity={0.9}
          />

          {position && (
            <Marker
              position={[position.coords.latitude, position.coords.longitude]}
              icon={createUserIcon(heading)}
            />
          )}
        </MapContainer>
      </div>

      {/* Bottom info bar */}
      <div className="google-nav-bottom-bar">
        <button className="recentre-btn" onClick={handleRecenter}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#00A6A6">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
          <span>Re-centre</span>
        </button>

        <div className="eta-info">
          <div className="eta-time-large">{selectedRoute.duration_display}</div>
          <div className="eta-details">
            {selectedRoute.distance_display} · {new Date(Date.now() + parseInt(selectedRoute.duration_display) * 60000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </div>
        </div>

        <button 
          className="rate-route-btn"
          onClick={() => setShowFeedback(true)}
          style={{
            padding: '8px 12px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          ⭐ Rate
        </button>

        <button className="exit-btn-google" onClick={handleExit}>
          Exit
        </button>
      </div>

      {showFeedback && (
        <FeedbackModal
          route={selectedRoute}
          onClose={() => {
            setShowFeedback(false);
            if (hasArrived) handleExit();
          }}
        />
      )}
    </div>
  );
};

export default NavigationView;
