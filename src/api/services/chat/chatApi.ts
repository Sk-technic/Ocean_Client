import type { IsendMedia, Message } from "../../../types/chat";
import api from "../../config/axiosconfig"


export const GetMessages = async (
  roomId: string,
  cursor?: string,
  limit = 50
): Promise<{
  messages: Message[];
  nextCursor: string | null;
  hasMore: boolean;
  noMoreMessages: boolean;
}> => {
  const response = await api.get(`/chat/messages/${roomId}`, {
    params: { cursor, limit },
  });

  const data = response?.data?.data ?? response?.data ?? {};

  const messages = data.messages ?? [];
  const nextCursor = data.nextCursor ?? null;
  const hasMore = data.hasMore ?? false;
  const noMoreMessages = data.noMoreMessages ?? !hasMore;

  return {
    messages,
    nextCursor,
    hasMore,
    noMoreMessages,
  };
  
};



const GetChatUsers = async (id:string)=>{
    try {
        const result = await api.get(`chat/users?id=${id}`);
        return result.data
    } catch (error: any) {
        throw error.response?.data ||error
    }
}

const GetRoomDetails = async (roomId:string,userId:string)=>{
    try {
        const result = await api.get(`chat/room`,{
          params:{roomId,userId}
        });
        return result.data
    } catch (error: any) {
        throw error.response?.data ||error
    }
}

const sendMediaFiles = async (data: IsendMedia) => {
  try {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "media" && Array.isArray(value)) {
        value.forEach((file) => formData.append("media", file));
      } else {
        formData.append(key, value as any);
      }
    });

    const result = await api.post(`/chat/send_media`, formData, {
      headers: { "Content-Type": "application/json" },
    });
    return result.data;
  } catch (error: any) {
    throw error.response?.data?.message || "Failed to send media";
  }
};

export const chatApi = {
    GetMessages,
    GetChatUsers,
    GetRoomDetails,
    sendMediaFiles
}