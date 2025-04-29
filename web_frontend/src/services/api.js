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