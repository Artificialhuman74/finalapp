import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Route, Preferences, Location } from '../types';

interface AppContextType {
  startLocation: Location | null;
  setStartLocation: (loc: Location | null) => void;
  endLocation: Location | null;
  setEndLocation: (loc: Location | null) => void;
  routes: Route[];
  setRoutes: (routes: Route[]) => void;
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  isNavigating: boolean;
  setIsNavigating: (nav: boolean) => void;
  showHeatmap: {
    crime: boolean;
    lighting: boolean;
    population: boolean;
    userFeedback: boolean;
  };
  setShowHeatmap: (heatmap: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    prefer_main_roads: false,
    prefer_well_lit: false,
    prefer_populated: false,
    safety_weight: 0.7,
    distance_weight: 0.3
  });
  const [showHeatmap, setShowHeatmap] = useState({
    crime: false,
    lighting: false,
    population: false,
    userFeedback: false
  });

  return (
    <AppContext.Provider
      value={{
        startLocation,
        setStartLocation,
        endLocation,
        setEndLocation,
        routes,
        setRoutes,
        selectedRoute,
        setSelectedRoute,
        preferences,
        setPreferences,
        isNavigating,
        setIsNavigating,
        showHeatmap,
        setShowHeatmap
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};
