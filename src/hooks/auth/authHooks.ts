import { useMutation, useQuery } from "@tanstack/react-query";
import type { ApiError, ILogin, ILoginResponse, IsignupData, User } from "../../types";
import { logout, setUser } from "../../store/slices/authSlice";
import { useDispatch } from "react-redux";
import { authAPI } from "../../api/services";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updateStatus } from "../../store/slices/userSlice";
import { getSocket } from "../../api/config/socketClient";
import { clearChatList } from "../../store/slices/chatList";
export const useSignup = () =>
  useMutation<any, ApiError, FormData>({
    mutationFn: async (data:FormData) => await authAPI.signup(data),
    onSuccess: () => alert("Signup successful! 🎉"),
    onError: (error) => {
      console.error("❌ Signup failed:", error);
      alert(error?.message || "Signup failed. Please try again.");
    },
  });

export const useLogin = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn:async (data:ILogin) =>await authAPI.login(data),

    onSuccess: (res:any) => {
      const user = res.data.loggedIn; // ✅ not res.data.loggedIn
      toast.success(`Welcome, ${user?.fullName?.split(' ')[0]}! 🎉`)
      const accessToken = res.data.accessToken;
      const refreshToken = res.data.refreshToken;
      dispatch(
        setUser({
          user,
          accessToken,
          refreshToken,
        })
      );

    },

    onError: (error:ApiError) => {      
      toast.error(error?.message);
    },
  });
};

export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: async () => {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.disconnect();
        console.log("🧹 Socket disconnected before logout");
      }

      await authAPI.logout(); 
    },

    onSuccess: () => {
      console.log("✅ Logout successful, cleaning up frontend...");

      dispatch(logout());
      dispatch(clearChatList());

      localStorage.removeItem("selectedChat");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();

      window.location.href = "/";
    },

    onError: (error: any) => {
      console.error("❌ Logout failed:", error);
      alert(error?.message || "Logout failed. Please try again.");
    },
  });
};



export const useAuthInit = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (storedUser && accessToken) {
      dispatch(
        setUser({
          user: JSON.parse(storedUser),
          accessToken: accessToken || "",
          refreshToken: refreshToken || "",
        })
      );
    }
  }, [dispatch]);

  const { data, isSuccess, isError, error, isFetching } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => authAPI.getCurrentUser(),
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (isFetching) return;

    if (isSuccess && data?.success && data.data) {
      dispatch(
        setUser({
          user: data.data,
          accessToken: localStorage.getItem("accessToken") || "",
          refreshToken: localStorage.getItem("refreshToken") || "",
        })
      );
      setIsLoading(false);
    } else if (isError) {
      const apiError = error as unknown as ApiError;
      if (apiError?.statusCode === 401) {
        dispatch(logout());
      }
      setIsLoading(false);
    }
  }, [isSuccess, isError, isFetching, data, error, dispatch]);

  return { isLoading, isSuccess, data };
};


export const authHooks = {
  useLogin,
  useSignup
}