import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { followApi } from "../../api/services/follow/followApi";
import { toast } from "react-hot-toast";
import type { ApiError } from "../../types";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../store/hooks";
import { addMutedUsers, setMutedUsers } from "../../store/slices/blockedUsers/muteUserSlice";

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

      return data; 
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
};

export const useRejectRequest = () => {
  return useMutation({
    mutationFn: async (data:{userId:string,notificationId:string}) => {
      if (!data) throw new Error("User ID missing.");
      const res = await followApi.rejectRequest(data);
      return res.data;
    },

    onSuccess: (data: any) => {
      toast.success(data?.message || "Request rejected!");
      // dispatch(updateNotification({id:loggedInUser?._id,}))
      return data;
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
};

export const useMuteFollow = ()=>{
  return useMutation({
    mutationFn:async(id:string)=>await followApi.blockfollowRequest(id)
  })
}

export const useUnMuteFollow = ()=>{
  return useMutation({
    mutationFn:async(id:string)=>await followApi.UnblockFollowRequest(id)
  })
}

export const useGetMuteUsers = () => {
  const dispatch = useAppDispatch();

  // ---------- INITIAL LOAD ----------
  const {
    mutateAsync: loadInitial,
    isPending: isInitialLoading
  } = useMutation({
    mutationFn: () => followApi.GetMutedUsers(null),
    onSuccess: (res: any) => {
      dispatch(setMutedUsers({
        data: res?.data?.data || [],
        cursor: res?.data?.nextCursor || null
      }));
    }
  });

  const {
    mutateAsync: loadMore,
    isPending: isLoadMoreLoading
  } = useMutation({
    mutationFn: (cursor: string | null) => followApi.GetMutedUsers(cursor),
    onSuccess: (res: any) => {
      dispatch(addMutedUsers({
        data: res?.data?.data || [],
        cursor: res?.data?.nextCursor || null
      }));
    }
  });

  return {
    loadInitial,       // call with loadInitial()
    loadMore,          // call with loadMore(cursor)
    isInitialLoading,  
    isLoadMoreLoading,
  };
};

export const useUnFollow = () => {
  return useMutation({
    mutationFn: async (id: string) => {   
      if (!id) throw new Error("User ID missing.");
      const res = await followApi.UnFollowUser(id);
      return res;
    },

    onSuccess: (data: any) => {
      return data;
    },

    onError: (error: ApiError) => {
      toast.error(error?.message || "Something went wrong.");
    },
  });
};