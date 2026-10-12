import axios from 'axios';

let rawBaseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://foodconnect-food-donation-and.onrender.com/api' : '/api');
if (rawBaseURL.startsWith('http')) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, '');
  if (!rawBaseURL.endsWith('/api')) {
    rawBaseURL = `${rawBaseURL}/api`;
  }
}

const api = axios.create({
  baseURL: rawBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const donationApi = {
  create: (data) => api.post('/donations', data),
  getAvailable: (category) => api.get('/donations', { params: { category, availableOnly: true } }),
  getAll: (category, status) => api.get('/donations', { params: { category, status } }),
  getById: (id) => api.get(`/donations/${id}`),
  getMy: () => api.get('/donations/my'),
  update: (id, data) => api.put(`/donations/${id}`, data),
  updateStatus: (id, status) => api.patch(`/donations/${id}/status`, { status }),
  delete: (id) => api.delete(`/donations/${id}`),
};

export const requestApi = {
  create: (data) => api.post('/donation-requests', data),
  getMy: () => api.get('/donation-requests/my'),
  getReceived: () => api.get('/donation-requests/received'),
  updateStatus: (id, status) => api.patch(`/donation-requests/${id}/status`, { status }),
};

export const deliveryApi = {
  getAvailable: () => api.get('/deliveries/available'),
  accept: (donationId) => api.post(`/deliveries/${donationId}/accept`),
  getMy: () => api.get('/deliveries/my'),
  updateStatus: (id, status) => api.patch(`/deliveries/${id}/status`, { status }),
};

export default api;
