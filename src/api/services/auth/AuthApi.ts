import type { ApiError, ILogin, ILoginResponse, IsignupData } from "../../../types";
import api from "../../config/axiosconfig";


const signup = async (data: FormData) => {
  const response = await api.post("/auth/signup", data);
  console.log(response.data);
  
  return response.data;
};

const login = async (data: ILogin): Promise<ILoginResponse> => {
  try {

    const response = await api.post("/auth/login", data);
    return response.data;
  } catch (err: any) {
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

const googleAuth = async () => {
  const response = await api.get('/auth/google')
  return response.data.data;
}

const verifyOtp = async (otp: string, userId: string) => {
  if (!otp || !userId) throw new Error("data missing")
  const response = await api.post(`/auth/verify-otp`, {
    token: otp,
    userId
  })

  return response.data
}

const autoLogin = async (id:string) =>{
  const response = await api.post(`/auth/auto-login`,{id:id})
  return response.data
}

const resendOtp = async (id:string) =>{
   const response = await api.post(`/auth/resendOTP`,{id:id})
  return response.data
}

const changePassword = async (oldPassword:string,newPassword:string)=>{
  console.log(oldPassword,newPassword);
  
   const response = await api.patch(`/auth/change-password`,{
      newPassword:newPassword,
      password:oldPassword
    })
    return response;
}

const sendVerificationMail = async (email:string)=>{
  return await api.post(`/auth/send-emailVerification`,{
    email
  })
}

const resetPassword = async (newPassword:string,userId:string)=>{
  await api.patch(`/auth/reset-password`,{
    newPassword,
    userId
  })
}
export const authAPI = {
  signup,
  login,
  logout,
  getCurrentUser,
  googleAuth,
  verifyOtp,
  autoLogin,
  resendOtp,
  changePassword,
  sendVerificationMail,
  resetPassword
};