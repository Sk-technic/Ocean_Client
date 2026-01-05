import { useMutation, useQueryClient, useQuery, Mutation, useInfiniteQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { UserApi } from "../../api/services";
import { setUser, updateAccountPrivacy } from "../../store/slices/authSlice"; // assuming you have this
import { toast } from "react-hot-toast";
import { store } from "../../store";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { use } from "react";
import { set } from "zod";
import { addBlockedUsers, removeBlockedUser, setBlockedUsers } from "../../store/slices/blockedUsers/blockedSlice";
import { updateBlockedUser, updateUnBlockedUser } from "../../store/slices/chatList";

const useUpdateCoverImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file provided");
      const formData = new FormData();
      formData.append("coverImage", file);
      return await UserApi.updateCoverImage(formData);
    },

    onSuccess: (response) => {

      if (response?.data?.user) {
        dispatch(setUser(response.data.user)); // update user in Redux
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to update cover image.");
    },
  });
};

const useUpdateProfileImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!file) throw new Error("No file provided");
      const formData = new FormData();
      formData.append("profilepic", file);
      return await UserApi.UpdateProfileImage(formData);
    },

    onSuccess: (response) => {

      if (response?.data?.user) {
        dispatch(setUser(response.data.user)); // update user in Redux
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

    },

    onError: (error: any) => {
      toast.error(error?.message || "Failed to update cover image.");
    },
  });
};

export const useDeleteProfileImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserApi.deleteProfileImage(),

    onSuccess: (response) => {
      const user = response?.data?.user;
      if (user) {
        dispatch(setUser(user)); // update Redux
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile image deleted.");
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete profile image.";
      toast.error(message);
    },
  });
};

export const useDeleteCoverImage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => UserApi.deleteCoverImage(),

    onSuccess: (response) => {
      const user = response?.data?.user;
      if (user) {
        dispatch(setUser(user)); // update Redux
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Cover image deleted.");
    },

    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to delete profile image.";
      toast.error(message);
    },
  });
};

export const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => UserApi.updateProfile(data),
    onSuccess: (response) => {
      const user = response?.data?.user;
      if (user) {
        dispatch(setUser(user)); // update Redux
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Profile updated successfully.");
    },
    onError: (error: any) => {
      // Check if it's an Axios error with response
      const message =
        error?.response?.data?.message || error?.message || "Failed to update profile.";
      toast.error(message);
    },
  });
};

export const useFindUser = (query: string) => {
  return useQuery({
    queryKey: ["findUser", query],
    queryFn: async () => {
      try {
        const result = await UserApi.findUser(query);
        return result?.data
      } catch (error: any) {
        const message =
          error?.message || error?.response?.data?.message || "Failed to fetch user.";
        throw message;
      }
    },
    enabled: !!query, // only runs if query is not empty
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export const useGetUser = (roomId: string) => {
  return useQuery({
    queryKey: ["GetUser", roomId],
    queryFn: async () => {
      try {
        return await UserApi.GetUser(roomId);
      } catch (error: any) {
        const message =
          error?.message || error?.response?.data?.message || "Failed to fetch user.";
        throw message;
      }
    },
  });
};

export const useAccountPrivacy = () => {
  return useMutation({
    mutationFn: async ({ userId, key }: { userId: string; key: string }) => {
      try {
        const result = await UserApi.updatePrivacy(userId, key);
        return result.data;
      } catch (error: any) {
        const message =
          error?.message ||
          error?.response?.data?.message ||
          "Failed to update privacy.";
        throw new Error(message);
      }
    },
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch()
  const activeRoom = useAppSelector(state => state.chat.activeRoom)
  return useMutation({
    mutationFn: async (data: {
      user: string;
      roomId: string | null;
      set: "blocked" | "muted";
    }) => await UserApi.blockUser(data),

    onSuccess: (res, variables) => {
      const { user, roomId, set } = variables;
      const { roomId: blockRoom, status, dmRoom } = res.data
      if (!roomId) return;
      dispatch(updateBlockedUser({ roomId: dmRoom || blockRoom, targetUser: user, set: status }))

      queryClient.setQueryData(
        ["roomMembers", roomId],
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((member: any) => {
                if (member.id !== user) return member;

                return {
                  ...member,
                  isBlocked: set === "blocked" ? true : member.isBlocked,
                  isMuted: set === "muted" ? true : member.isMuted,
                };
              }),
            })),
          };
        }
      );
      toast.success(`user ${status}`)
    },
  });
};

export const useGetBlockedUsers = () => {
  return useInfiniteQuery<
    {
      data: {
        blocked: any[];
        unblocked: any[];
      };
      nextCursor: string | null;
    },
    Error,
    any,
    string[],
    string | null
  >({
    queryKey: ["blockedUsers"],
    initialPageParam: null,
    queryFn: async ({ pageParam }) => {
      return UserApi.GetBlockedUsers(pageParam ?? undefined);
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor ?? undefined,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });
};

export const useUnBlockUser = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch()
  return useMutation({
    mutationFn: async (blockedUser: string) => {
      return UserApi.UnblockUser(blockedUser);
    },

    onSuccess: (res) => {
      const { targetUser, status, roomId, dmRoom } = res.data;
      dispatch(updateUnBlockedUser({ roomId: dmRoom || roomId, targetUser, set: status }))
      if (roomId) {
        queryClient.setQueryData(
          ["roomMembers", roomId],
          (oldData: any) => {
            if (!oldData?.pages) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                data: page.data.map((member: any) => {
                  if (member.id !== targetUser) return member;

                  return {
                    ...member,
                    isBlocked:
                      status === "blocked" ? false : member.isBlocked,
                    isMuted:
                      status === "muted" ? false : member.isMuted,
                  };
                }),
              })),
            };
          }
        );
      }

      queryClient.setQueryData(
        ["blockedUsers"],
        (oldData: any) => {
          if (!oldData?.pages) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: {
                ...page.data,
                blocked:
                  status === "blocked"
                    ? page.data.blocked.filter(
                      (u: any) => u.blocked?._id !== targetUser
                    )
                    : page.data.blocked,

                muted:
                  status === "muted"
                    ? page.data.muted.filter(
                      (u: any) => u.blocked?._id !== targetUser
                    )
                    : page.data.muted,
              },
            })),
          };
        }
      );

      toast.success(`user Un${status}`)
    },
  });
};


type FollowType = "followers" | "following";

type Cursor = {
  createdAt: string;
  _id: string;
} | null;

type UseFriendsListParams = {
  userId: string;
  viewerId: string;
  type: FollowType;
};

export const useFriendsList = ({
  userId,
  viewerId,
  type,
}: UseFriendsListParams) => {
  return useInfiniteQuery({
    queryKey: ["friendsList", userId, viewerId, type],

    enabled: Boolean(userId && viewerId && type),

    queryFn: async ({ pageParam }) => {
      const res = await UserApi.getFriendsList({
        userId,
        viewerId,
        type,
        cursor: pageParam ? JSON.stringify(pageParam) : undefined,
      });

      return res.data;
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      return lastPage?.nextCursor ?? null;
    },

    staleTime: 1000 * 60 * 5, // 5 min
    gcTime: 1000 * 60 * 10,   // 10 min
    refetchOnWindowFocus: false,
  });
};


export const userHooks = {
  useUpdateCoverImage,
  useUpdateProfileImage,
  useDeleteProfileImage,
  useDeleteCoverImage,
  useUpdateProfile,
  useFindUser,
  useGetUser,
  useAccountPrivacy,
  useUnBlockUser
};