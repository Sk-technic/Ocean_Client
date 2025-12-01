import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { UserApi } from "../../api/services";
import { setUser } from "../../store/slices/authSlice"; // assuming you have this
import { toast } from "react-toastify";

/**
 * Hook: useUpdateCoverImage
 * Handles uploading and updating user's cover image.
 */
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

/**
 * Hook: useUpdateProfileImage
 * Handles uploading and updating user's Profile image.
 */
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

/**
 * Hook: useDeleteProfileImage
 * Handles delete user's Profile image.
 */
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

/**
 * Hook: useDeleteCoverImage
 * Handles delete user's Cover image.
 */
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

/**
 * Hook: useUpdateProfile
 * Handles Edit user's profile detail's.
 */
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
        return await UserApi.findUser(query);
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

export const userHooks = {
  useUpdateCoverImage,
  useUpdateProfileImage,
  useDeleteProfileImage,
  useDeleteCoverImage,
  useUpdateProfile,
  useFindUser,
  useGetUser
};