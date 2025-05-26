import axios from 'axios';

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (formData) => API.post('api/auth/login', formData);

export const createTaskHandler = (data) => API.post('/api/admin/create-task-handler', data);
export const getTaskHandlers = () => API.get('/api/admin/task-handlers');

export const getDueLocations = () => API.get('/api/bins/due-locations');

export const getAvailableCollectors = () => API.get('/api/collector/available-collectors');
export const allocateCollector = (binId, collectorId) =>
  API.post('/api/admin/allocate-collector', { binId, collectorId });
