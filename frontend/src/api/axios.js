import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || '/api';

// If it looks like a domain but missing protocol, fix it
if (baseUrl && !baseUrl.startsWith('http') && baseUrl.includes('.')) {
  baseUrl = `https://${baseUrl.startsWith('/') ? baseUrl.substring(1) : baseUrl}`;
}

// Ensure it ends with /api but not /api/
if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
if (!baseUrl.endsWith('/api') && baseUrl !== '/api') {
  baseUrl = `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: baseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
