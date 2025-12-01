// src/api/config/refreshAxios.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Separate Axios instance (no interceptors)
export const refreshAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
