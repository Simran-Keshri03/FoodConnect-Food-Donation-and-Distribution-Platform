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
  timeout: 75000, // 75s generous timeout to accommodate Render free-tier cold starts
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

// Response interceptor with automatic retry for cold-start network glitches
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const config = error.config;

    // Clear session on 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    // Check if eligible for cold-start retry (Network Error, 502, 503, 504, timeout)
    const isNetworkOrColdStart =
      !error.response ||
      error.code === 'ECONNABORTED' ||
      [502, 503, 504].includes(error.response?.status);

    if (config && !config.__isRetry && isNetworkOrColdStart) {
      config.__isRetry = true;
      // Wait 3 seconds for container/preflight to stabilize before retry
      await new Promise((resolve) => setTimeout(resolve, 3000));
      return api(config);
    }

    // Friendly error messaging
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        message = 'Cloud server took too long to respond. The free tier instance is spinning up—please retry in a moment!';
      } else if (!error.response) {
        message = 'Unable to reach cloud server. It may be waking up from free-tier sleep. Please try again shortly!';
      } else {
        message = error.message || 'An unexpected error occurred';
      }
    }

    return Promise.reject(new Error(message));
  }
);

/**
 * Proactively pings backend to wake up sleeping instances before user submits forms
 */
export const warmUpServer = async () => {
  try {
    await api.get('/health', { timeout: 20000 });
    return true;
  } catch {
    try {
      await api.get('/donations', { params: { availableOnly: true }, timeout: 25000 });
      return true;
    } catch {
      return false;
    }
  }
};

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  warmUp: warmUpServer,
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
