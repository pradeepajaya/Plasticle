// src/services/api.js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const login = (formData) => API.post('/auth/login', formData);
export const createTaskHandler = (data) => API.post('/admin/create-task-handler', data);
export const getTaskHandlers = () => API.get('/admin/task-handlers');
// Soft delete (deactivate) a task handler
export const deactivateTaskHandler = (id) => API.put(`/admin/deactivate-taskhandler/${id}`);


export const getDueLocations = () => API.get('/bins/due-locations');
export const getAvailableCollectors = () => API.get('/admin/available-collectors');

export const allocateCollector = (binId, collectorId, collectionDate) =>
  API.post('/admin/allocate-collector', { binId, collectorId, collectionDate, });
export const getManufacturers = () => API.get('/admin/manufacturers');
export const getFilledBinsWithCollectors = () =>
  API.get('/admin/filled-bins-with-collectors');

export const updateManufacturer = async (userId, updatedData) => {
  return await API.put(`/admin/manufacturers/${userId}`, updatedData);
};
export const checkUrgentAllocations = () => API.get('/bins/check-urgent');

export const notifyAllCollectors = async (message) => {
  return await API.post('/admin/notify-all-collectors', { message });
};

export const getCollectorNotifications = async (userId) => {
  return await API.get(`/collector/notifications?userId=${userId}`);
};
