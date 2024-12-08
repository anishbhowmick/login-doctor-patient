import axios from 'axios';
import { getAuthToken } from './auth';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust based on your backend URL
  withCredentials: true, // Include cookies if needed
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 