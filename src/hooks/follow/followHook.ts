import { useMutation } from "@tanstack/react-query";
import { followApi } from "../../api/services/follow/followApi";
import { toast } from "react-toastify";
import type { ApiError } from "../../types";


export const useFollow = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      if (!id) throw new Error("User ID missing.");
      const res = await followApi.sendRequest(id);
      return res.data;
    },

    onSuccess: (data: any) => {
      toast.success(data?.message || "Request sent!");

      return data; // VERY IMPORTANT
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
};

export const useAcceptRequest = () => {
  return useMutation({
    mutationFn: async (data:{userId:string,notificationId:string}) => {
      if (!data) throw new Error("User ID missing.");
      const res = await followApi.acceptRequest(data);
      return res.data;
    },

    onSuccess: (data: any) => {
      toast.success(data?.message || "Request sent!");

      return data; // VERY IMPORTANT
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
};
