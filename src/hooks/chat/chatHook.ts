import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { chatApi } from "../../api/services/chat/chatApi";
import { setBulkPresence, setChatList } from "../../store/slices/chatList";
import type { ChatRoom, IsendMedia, Message } from "../../types/chat";
import type { AxiosError } from "axios";
import { useAppDispatch } from "../../store/hooks";
import { useEffect } from "react";
import { toast } from "react-toastify";
import type { ApiError } from "../../types";
import { getSocket } from "../../api/config/socketClient";
import { addMessage } from "../../store/slices/messages/messages";


interface ChatMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
  noMoreMessages: boolean;
}

/**
 * useChatMessages Hook
 * Fetches messages with cursor-based pagination for a chat room
 */

export const useMessages = (roomId: string, limit = 50) => {
  return useInfiniteQuery<ChatMessagesResponse, Error>({
    queryKey: ["chatMessages", roomId],
    queryFn: async ({ pageParam }): Promise<ChatMessagesResponse> => {
      const cursor = pageParam as string | undefined; // first call -> undefined
      return await chatApi.GetMessages(roomId, cursor, limit);
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,

    initialPageParam: undefined,

    refetchOnWindowFocus: false,
    staleTime: 0, // 1 minute cache
    enabled: !!roomId, // fetch only when roomId is available
  });
};

export const useChatUsers = (userId?: string, isConnected = false) => {
  const dispatch = useAppDispatch();

  const query = useQuery<ChatRoom[], AxiosError>({
    queryKey: ["chatUsers", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const res = await chatApi.GetChatUsers(userId);
      console.log("🧠 Chat users fetched:", res.data);
      return res.data;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!query.data) return;
    dispatch(setChatList(query.data));
  }, [query.data, dispatch]);

  useEffect(() => {
    if (!isConnected || !query.data || !userId) return;

    const socket = getSocket();
    if (!socket) {
      return;
    }

    const allIds = query.data.flatMap((room) =>
      room.participants
        .map((p) => p._id)
        .filter((id) => id !== userId)
    );

    if (!allIds.length) {
      return;
    }

    socket.emit(
      "user:get_online_users",
      allIds,
      (statuses: {
        userId: string;
        isOnline: boolean;
        lastActive?: number | null;
      }[]) => {

        if (Array.isArray(statuses) && statuses.length > 0) {
          const sanitized = statuses.map((s) => ({
            userId: s.userId,
            isOnline: s.isOnline,
            lastActive:
              typeof s.lastActive === "number"
                ? s.lastActive
                : Date.now(),
          }));

          dispatch(setBulkPresence(sanitized));
        } else {
          console.warn("⚠️ No statuses returned from server");
        }
      }
    );
  }, [isConnected, query.data, userId, dispatch]);

  return query;
};

export const useGetRoom = (roomId: string, userId: string) => {  
  const query = useQuery({
    queryKey: ["getRoom", roomId, userId],
    queryFn: async () => {
      if (!roomId || !userId) throw new Error("roomId or userId fot found.");
      const res = await chatApi.GetRoomDetails(roomId, userId);      
      return res;
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false
  });
  return query
};

export const useSendMedia = () => {
//  const dispatch = useAppDispatch()
  return useMutation({
    mutationFn: async (data: IsendMedia) => {
      if (!data || !data.media) throw new Error("media is missing.");
      const res = await chatApi.sendMediaFiles(data);
      return res.data;
    },
   onSuccess: () => {
      toast.success("Media send successfully!");
      // dispatch(addMessage(data?.message))
    },
    onError: (error: ApiError) => {
      toast.error(error?.message);
    },
  });
};