export interface Route {
  rank: number;
  is_recommended: boolean;
  category: string;
  emoji?: string;
  description: string;
  distance_km: number;
  duration_min: number;
  safety_score: number;
  crime_density: number;
  max_crime_exposure: number;
  lighting_score: number;
  population_score: number;
  main_road_percentage: number;
  distance_display: string;
  duration_display: string;
  safety_display: string;
  reasons: string[];
  warning?: string;
  route: Array<[number, number]>;
}

export interface Preferences {
  prefer_main_roads: boolean;
  prefer_well_lit: boolean;
  prefer_populated: boolean;
  safety_weight: number;
  distance_weight: number;
}

export interface Location {
  lat: number;
  lon: number;
  name?: string;
}

export interface NavigationStep {
  instruction: string;
  distance: number;
  direction: string;
}
