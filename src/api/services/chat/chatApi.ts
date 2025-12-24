import type { ChatRoom, Message } from "../../../types/chat";
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



export const GetChatUsers = async (
  id: string,
  cursor?: string | null
) => {
  try {
    const params = new URLSearchParams({ id });
    if (cursor) params.append("cursor", cursor);

    const result = await api.get(`chat/users?${params.toString()}`);
    return result.data.data as {
      data: ChatRoom[];
      nextCursor: string | null;
      hasNext: boolean;
    };
  } catch (error: any) {
    throw error.response?.data || error;
  }
};


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

const sendMediaFiles = async (data: FormData) => {
  try {
    const result = await api.post(`/chat/send_media`, data);
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