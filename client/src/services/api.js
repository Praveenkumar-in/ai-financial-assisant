import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://financal-ai.netlify.app/api",
  withCredentials: true
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(error)
);

export const unwrap = (response) => response.data.data;
