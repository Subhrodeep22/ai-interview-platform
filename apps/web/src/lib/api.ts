import axios from 'axios';

// Ensure baseURL doesn't have trailing slash and doesn't include /api
const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  // Remove trailing slash if present
  url = url.replace(/\/$/, '');
  // Remove /api suffix if accidentally included (endpoints include /api in their paths)
  url = url.replace(/\/api$/, '');
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // optional if you plan to use cookies
});

// Automatically attach token from localStorage
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Debug: Log token presence (not the actual token)
        if (process.env.NODE_ENV === 'development') {
          console.log('API Request:', {
            url: config.url,
            hasToken: !!token,
            tokenLength: token.length,
          });
        }
      } else {
        console.warn('No token found in localStorage for request:', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      if (error.response.status === 401) {
        // Token expired or invalid - clear it
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          // Only redirect if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            console.warn('Unauthorized - token may be expired. Please login again.');
          }
        }
      }
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API Request Error:', {
        url: error.config?.url,
        method: error.config?.method,
        message: 'No response from server. Is the API running?',
      });
    } else {
      // Error setting up the request
      console.error('API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;