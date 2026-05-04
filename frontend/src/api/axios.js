import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Force absolute URL if protocol is missing
if (baseUrl && !baseUrl.startsWith('http')) {
  baseUrl = `https://${baseUrl}`;
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
