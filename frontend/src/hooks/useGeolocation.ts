import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  position: GeolocationPosition | null;
  error: string | null;
  accuracy: 'high' | 'medium' | 'low' | null;
}

export const useGeolocation = (watch: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    accuracy: null
  });

  const getAccuracyLevel = (accuracy: number): 'high' | 'medium' | 'low' => {
    if (accuracy <= 10) return 'high';
    if (accuracy <= 50) return 'medium';
    return 'low';
  };

  const getCurrentPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocation is not supported' }));
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 30000, // 30 seconds as per RECENT_CHANGES.md
      maximumAge: 0
    };

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setState({
            position,
            error: null,
            accuracy: getAccuracyLevel(position.coords.accuracy)
          });
        },
        (error) => {
          setState(prev => ({ ...prev, error: error.message }));
        },
        options
      );

      return () => navigator.geolocation.clearWatch(watchId);
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            position,
            error: null,
            accuracy: getAccuracyLevel(position.coords.accuracy)
          });
        },
        (error) => {
          setState(prev => ({ ...prev, error: error.message }));
        },
        options
      );
    }
  }, [watch]);

  useEffect(() => {
    const cleanup = getCurrentPosition();
    return cleanup;
  }, [getCurrentPosition]);

  return { ...state, refresh: getCurrentPosition };
};
