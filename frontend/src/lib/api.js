import axios from 'axios';

// Configurable so the app works anywhere it is deployed, not just localhost.
// Hosts like Render inject a bare hostname, so add the scheme when it is missing.
const configured = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_URL = configured.includes('://') ? configured : `https://${configured}`;

const api = axios.create({ baseURL: API_URL });

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const AUTH_ENDPOINTS = ['/user/login', '/user/signup'];

// A 401 on anything other than login/signup means the token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthCall = AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

    if (error.response?.status === 401 && !isAuthCall && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('truechoice:session-expired'));
    }

    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.error || error?.response?.data?.message || fallback;

export default api;
