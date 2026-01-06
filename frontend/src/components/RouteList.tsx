import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Route } from '../types';

const RouteList: React.FC = () => {
  const { routes, selectedRoute, setSelectedRoute, setIsNavigating } = useAppContext();

  if (routes.length === 0) {
    return null;
  }

  const getCategoryBadge = (category: string) => {
    const badges: { [key: string]: { color: string; text: string } } = {
      'best_balanced': { color: '#059669', text: '⭐ Best Overall' },
      'safest': { color: '#1e40af', text: '🛡️ Safest' },
      'fastest': { color: '#d97706', text: '⚡ Fastest' },
      'main_roads': { color: '#7c3aed', text: '🛣️ Main Roads' },
      'well_lit': { color: '#0891b2', text: '💡 Well Lit' },
      'populated': { color: '#db2777', text: '👥 Populated' }
    };

    const badge = badges[category] || { color: '#6b7280', text: category };
    return (
      <span className="category-badge" style={{ backgroundColor: badge.color }}>
        {badge.text}
      </span>
    );
  };

  const getSafetyColor = (score: number) => {
    if (score >= 90) return '#059669'; // dark green
    if (score >= 75) return '#1e40af'; // dark blue
    if (score >= 60) return '#d97706'; // dark orange
    return '#b91c1c'; // dark red
  };

  const handleStartNavigation = (route: Route) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  return (
    <div className="route-list">
      <div className="route-list-header">
        <h2>🗺️ Route Options</h2>
        <p>{routes.length} routes found</p>
      </div>

      <div className="routes-container">
        {routes.map((route, idx) => (
          <div
            key={idx}
            className={`route-card ${selectedRoute === route ? 'selected' : ''}`}
            onClick={() => setSelectedRoute(route)}
          >
            <div className="route-header">
              <div className="route-rank">#{route.rank}</div>
              <div className="route-category">
                {getCategoryBadge(route.category)}
                {route.is_recommended && (
                  <span className="recommended-badge">✨ Recommended</span>
                )}
              </div>
            </div>

            <div className="route-description">
              {route.emoji} {route.description}
            </div>

            <div className="route-stats">
              <div className="stat">
                <span className="stat-label">Distance</span>
                <span className="stat-value">{route.distance_display}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Duration</span>
                <span className="stat-value">{route.duration_display}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Safety</span>
                <span
                  className="stat-value"
                  style={{ color: getSafetyColor(route.safety_score) }}
                >
                  {route.safety_display}
                </span>
              </div>
            </div>

            <div className="route-details">
              <div className="detail-row">
                <span>🔴 Crime Exposure:</span>
                <span>{route.crime_density.toFixed(1)}/km</span>
              </div>
              <div className="detail-row">
                <span>💡 Lighting:</span>
                <span>{route.lighting_score}%</span>
              </div>
              <div className="detail-row">
                <span>👥 Population:</span>
                <span>{route.population_score}%</span>
              </div>
              <div className="detail-row">
                <span>🛣️ Main Roads:</span>
                <span>{route.main_road_percentage}%</span>
              </div>
            </div>

            {route.reasons && route.reasons.length > 0 && (
              <div className="route-reasons">
                <strong>Why this route:</strong>
                <ul>
                  {route.reasons.map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {route.warning && (
              <div className="route-warning">
                ⚠️ {route.warning}
              </div>
            )}

            <button
              className="btn btn-primary btn-navigate"
              onClick={(e) => {
                e.stopPropagation();
                handleStartNavigation(route);
              }}
            >
              🧭 Start Navigation
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteList;
