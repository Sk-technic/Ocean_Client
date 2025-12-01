import type { ApiError, ILogin, ILoginResponse, IsignupData } from "../../../types";
import api from "../../config/axiosconfig";


const signup = async (data: FormData) => {
  const response = await api.post("/auth/signup", data);
  return response;
};


const login = async (data: ILogin): Promise<ILoginResponse> => {
  try {
    
    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (err:any) {
      throw err.response?.data || err; // ✅ Force React Query to go to onError
  }
}

const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
}

const logout = async (): Promise<void> => {
  await api.post("/auth/logout", {}, { withCredentials: true });

}

export const authAPI = {
  signup,
  login,
  logout,
  getCurrentUser,
};