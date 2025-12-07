import axios from "axios";
import { store } from "../../store";
import { updateAccessToken, logout } from "../../store/slices/authSlice";
import { reconnectSocket } from "./socketClient";
import { refreshAxios } from "./refreshAxios"; // clean instance

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<any> | null = null;

api.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }
  const state = store.getState();
  const token = state.auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        console.warn("⚠️ No refresh token found — logging out");
        store.dispatch(logout());
        return Promise.reject(error);
      }

      if (!refreshPromise) {
        refreshPromise = refreshAxios
          .post("/auth/refreshAccessToken", { token: refreshToken }, { withCredentials: true })
          .then((response) => response)
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const response = await refreshPromise;
        const { accessToken, refreshToken: newRefreshToken } = response.data?.data || {};

        if (!accessToken) throw new Error("No accessToken in response");

        // ✅ Update Redux and localStorage
        store.dispatch(updateAccessToken({ accessToken, refreshToken: newRefreshToken }));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        // ✅ Reconnect socket with new token
        reconnectSocket(accessToken);

        // ✅ Update axios headers
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        // ✅ Retry the original failed request
        return api(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
        store.dispatch(logout());
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
