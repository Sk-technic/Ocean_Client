import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatRoom, Message } from "../../types/chat";

interface ChatListState {
  list: ChatRoom[];
  loading: boolean;
  error: string | null;
  activeRoom?:ChatRoom|null;
}

const initialState: ChatListState = {
  list: [],
  loading: false,
  error: null,
  activeRoom:null
};

const chatListSlice = createSlice({
  name: "chatList",
  initialState,
  reducers: {
    setChatList: (state, action: PayloadAction<ChatRoom[]>) => {

      state.list = action.payload;
      state.loading = false;
      state.error = null;
    },

    addChatRoom: (state, action: PayloadAction<ChatRoom>) => {
      const exists = state.list.some((room) => room._id === action.payload._id);
      if (!exists) {
        state.list.unshift(action.payload);
      }
    },

    acceptMessageRequest: (state, action: PayloadAction<{ roomId: String, status: string }>) => {
      const index = state.list.findIndex(
        n => n._id === action.payload.roomId.toString()
      );
      console.log(JSON.parse(JSON.stringify(index)));

      if (index !== -1) {
        state.list[index] = {
          ...state.list[index],
          status: action.payload.status
        };

        state.list = [...state.list];
      }
    },

    updateCount: (
      state,
      action: PayloadAction<{ roomId: string; userId: string; count: number }>
    ) => {
      const { roomId, userId, count } = action.payload;
      const room = state.list.find(r => r._id === roomId);
      if (room) {
        const participant = room.participants.find(p => p?._id == userId);
        if (participant) {
          participant.unreadCount = typeof count === "number" ? count : 0;
        }
      }
    },

    clearLastMessage: (
      state,
      action: PayloadAction<{ roomId: string }>
    ) => {
      const { roomId } = action.payload;
      const index = state.list.findIndex((r) => r._id === roomId);
      if (index === -1) return; // no crash

      if (!state.list[index].lastMessageMeta) {
        state.list[index].lastMessageMeta = {
          _id: "",
          sender: null as any,
          text: "",
          createdAt: ''
        };
        return;
      }

      state.list[index].lastMessageMeta!.text = "";
      state.list[index].lastMessageMeta!.createdAt = '';
    },

    updateLastMessage: (
      state,
      action: PayloadAction<{ roomId: string; message: Message }>
    ) => {

      const { roomId, message } = action.payload;
      const index = state.list.findIndex((r) => r._id === roomId);


      if (index !== -1) {
        const room = state.list[index];
        if (message?.isDeleted == false) {
          room.lastMessageMeta = {
            _id: message._id,
            sender: message?.sender?._id,
            text: message?.lastMessage || "no message",
            createdAt: message.createdAt,
          };
        } else {
          if (room.lastMessageMeta?.createdAt == message?.createdAt && message?.isDeleted) {

            room.lastMessageMeta = {
              _id: message._id,
              sender: message?.sender?._id,
              text: message?.lastMessage || "message unavailable",
              createdAt: message.createdAt,
            };
          }
        }

        state.list.splice(index, 1);
        state.list.unshift(room);
      }
    },

    updateUserPresence: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean; lastActive?: number }>
    ) => {
      const { userId, isOnline, lastActive } = action.payload;


      state.list = state.list.map((room) => ({
        ...room,
        participants: room.participants.map((p) =>
          p._id === userId
            ? {
              ...p,
              isOnline,
              lastActive: lastActive ?? p.lastActive,
            }
            : p
        ),
      }));
    },

    setBulkPresence: (
      state,
      action: PayloadAction<
        { userId: string; isOnline: boolean; lastActive?: number }[]
      >
    ) => {
      const presenceMap = new Map(action.payload.map((p) => [p.userId, p]));

      state.list = state.list.map((room) => ({
        ...room,
        participants: room.participants.map((p) => {
          const presence = presenceMap.get(p._id);
          return presence
            ? {
              ...p,
              isOnline: presence.isOnline,
              lastActive:
                presence.lastActive !== undefined
                  ? presence.lastActive
                  : p.lastActive,
            }
            : p;
        }),
      }));
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setActiveRoom: (state, action: PayloadAction<ChatRoom>) => {
      state.activeRoom = null;
      state.activeRoom = action.payload;
    },

    clearChatList: () => initialState,
  },
});

export const {
  setChatList,
  addChatRoom,
  updateLastMessage,
  updateUserPresence,
  setBulkPresence,
  setError,
  clearChatList,
  clearLastMessage,
  updateCount,
  acceptMessageRequest,
  setActiveRoom
} = chatListSlice.actions;

export default chatListSlice.reducer;
