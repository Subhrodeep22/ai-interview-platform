import axios from 'axios';

const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  url = url.replace(/\/$/, ''); // remove trailing slash
  url = url.replace(/\/api$/, ''); // ensure no /api
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // optional if using cookies in future
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === 'development') {
          console.log('%c[API Request]', 'color: #888', {
            url: config.url,
            hasToken: true,
            tokenLength: token.length,
          });
        }
      } else if (process.env.NODE_ENV === 'development') {
        console.warn('[API Request] No token found for', config.url);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      if (status === 401) {
        // Token invalid or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          console.warn(
            `%c[Unauthorized] ${config?.url} — Token expired or invalid.`,
            'color: orange; font-weight: bold;'
          );

          // Avoid infinite redirects if already on login
          if (!window.location.pathname.includes('/login')) {
            // Optionally redirect user to login
            // window.location.href = '/login';
          }
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
          url: config?.url,
          method: config?.method,
          status,
          data: error.response.data,
        });
      }
    } else if (error.request) {
      // Request made but no response
      console.error('[API Request Error]', {
        url: error.config?.url,
        message: 'No response from server. Is the backend running?',
      });
    } else {
      // Request setup error
      console.error('[API Setup Error]', error.message);
    }

    return Promise.reject(error);
  }
);

export async function fetchUserProfile() {
  try {
    const res = await api.get('/api/auth/me');
    return res.data;
  } catch (error) {
    console.error('[Fetch User Error]', error);
    return null;
  }
}

export default api;