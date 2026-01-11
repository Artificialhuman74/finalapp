import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 60000 // 60 seconds for route optimization
});

// Create separate instance for quick API calls
const quickApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000 // 15 seconds for quick calls
});

export const searchPlace = async (query: string) => {
  const response = await quickApi.get(`/api/search-place?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const reverseGeocode = async (lat: number, lon: number) => {
  const response = await quickApi.get(`/api/reverse-geocode?lat=${lat}&lon=${lon}`);
  return response.data;
};

export const optimizeRoute = async (data: {
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  prefer_main_roads?: boolean;
  prefer_well_lit?: boolean;
  prefer_populated?: boolean;
  safety_weight?: number;
  distance_weight?: number;
}) => {
  try {
    const response = await api.post('/api/optimize-route', data);
    return response.data;
  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Route calculation is taking longer than expected. Please try again.');
    }
    throw error;
  }
};

export const getCrimeHeatmap = async () => {
  const response = await quickApi.get('/api/crime-heatmap');
  return response.data;
};

export const getLightingHeatmap = async () => {
  const response = await quickApi.get('/api/lighting-heatmap');
  return response.data;
};

export const getPopulationHeatmap = async () => {
  const response = await quickApi.get('/api/population-heatmap');
  return response.data;
};

export const getUserFeedbackHeatmap = async () => {
  const response = await quickApi.get('/api/user-feedback-heatmap');
  return response.data;
};

export const rateRoute = async (data: {
  route_id: string;
  rating: number;
  feedback?: string;
}) => {
  const response = await api.post('/api/rate-route', data);
  return response.data;
};

export const submitUnsafeSegments = async (data: {
  route_id: string;
  rating: number;
  unsafe_segments: Array<{ lat: number; lon: number }>;
  route_data?: any;
}) => {
  const response = await api.post('/api/submit-unsafe-segments', data);
  return response.data;
};

export const checkHealth = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
