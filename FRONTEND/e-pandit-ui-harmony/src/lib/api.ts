import axios from "axios";

// Base URL points to the Node.js backend or deployed URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercept requests to inject the JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("epandit_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, clear local storage
      localStorage.removeItem("epandit_token");
      localStorage.removeItem("epandit_user");
      // Optional: window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default api;
