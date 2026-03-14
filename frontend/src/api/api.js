import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
};

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`),
};

export const communicationsAPI = {
  getAll: (params) => api.get('/communications', { params }),
  getById: (id) => api.get(`/communications/${id}`),
  uploadEmail: (data) => api.post('/communications/email', data),
  uploadTranscript: (data) => api.post('/communications/transcript', data),
  analyze: (id) => api.post(`/communications/${id}/analyze`),
  delete: (id) => api.delete(`/communications/${id}`),
};

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const slasAPI = {
  getAll: () => api.get('/slas'),
  getById: (id) => api.get(`/slas/${id}`),
  create: (data) => api.post('/slas', data),
  update: (id, data) => api.put(`/slas/${id}`, data),
  delete: (id) => api.delete(`/slas/${id}`),
};

export const alertsAPI = {
  getAll: () => api.get('/alerts'),
  getCritical: () => api.get('/alerts/critical'),
  getDashboard: () => api.get('/alerts/dashboard'),
};

export const domainsAPI = {
  getAll: () => api.get('/domains'),
  create: (data) => api.post('/domains', data),
};

export default api;
