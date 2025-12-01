// utils/logoutUser.ts
import { authAPI } from "../api/services";
import { store } from "../store";
import { logout } from "../store/slices/authSlice";

export const logoutUser = async () => {
  try {
    await authAPI.logout(); // backend clears cookie
  } catch (e) {
    console.warn("Logout request failed", e);
  }
  store.dispatch(logout());
  // Client-side redirect only once
  window.location.assign("/login");
};
