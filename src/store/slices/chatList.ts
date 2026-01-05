import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatRoom, IParticipant, Message } from "../../types/chat";

interface ChatListState {
  list: ChatRoom[];
  loading: boolean;
  error: string | null;
  activeRoom?: ChatRoom | null;
}

const initialState: ChatListState = {
  list: [],
  loading: false,
  error: null,
  activeRoom: null
};

const chatListSlice = createSlice({
  name: "chatList",
  initialState,
  reducers: {
    setChatList: (state, action: PayloadAction<ChatRoom[]>) => {
      const incomingRooms = action.payload;

      state.list = incomingRooms.map((newRoom) => {
        const existingRoom = state.list.find(
          (r) => r._id === newRoom._id
        );

        if (!existingRoom) {
          return newRoom;
        }

        if (newRoom.type === "group") {
          return {
            ...existingRoom,
            ...newRoom,
            participants: [], // always empty for group
          };
        }

        return {
          ...existingRoom,
          ...newRoom,
          participants: newRoom.participants.map((p) => {
            const existingParticipant =
              existingRoom.participants.find(
                (ep) => ep._id === p._id
              );

            return existingParticipant
              ? {
                ...p,
                isOnline: existingParticipant.isOnline,
                lastActive: existingParticipant.lastActive,
              }
              : p;
          }),
        };
      });

      state.loading = false;
      state.error = null;
    },

    updateBlockedUser: (
      state,
      action: PayloadAction<{
        roomId: string;
        targetUser: string;
        set: "blocked" | "muted";
      }>
    ) => {
      const { roomId, targetUser, set } = action.payload;

      const room = state.list.find((r) => r._id === roomId);
      if (!room || room.type !== "dm") return;

      const updateParticipant = (participant: any) => {
        if (participant._id !== targetUser) return;

        if (participant.isBlocked && set === "muted") return;

        if (set === "blocked") {
          participant.isBlocked = true;
          participant.isMuted = false;
        }

        if (set === "muted") {
          participant.isMuted = true;
        }
      };
      room.participants.forEach(updateParticipant);
      if (state.activeRoom?._id === roomId) {
        state.activeRoom.participants.forEach(updateParticipant);
      }
    },

    updateUnBlockedUser: (
      state,
      action: PayloadAction<{
        roomId: string;
        targetUser: string;
        set: "blocked" | "muted";
      }>
    ) => {
      const { roomId, targetUser, set } = action.payload;
      const room = state.list.find((r) => r._id === roomId);
      if (!room || room.type !== "dm") return;
      const updateParticipant = (participant: any) => {
        if (participant._id !== targetUser) return;
        if (set === "blocked") {
          participant.isBlocked = false;
        }
        if (set === "muted") {
          participant.isMuted = false;
        }
      };
      room.participants.forEach(updateParticipant);
      if (state.activeRoom?._id === roomId) {
        state.activeRoom.participants.forEach(updateParticipant);
      }
    },

    addChatRoom: (state, action: PayloadAction<ChatRoom>) => {
      const exists = state.list.some((room) => room._id === action.payload._id);
      if (!exists) {
        state.list.unshift(action.payload);
      }
    },

    acceptMessageRequest: (
      state,
      action: PayloadAction<{ roomId: string; status: string }>
    ) => {
      const index = state.list.findIndex(
        n => n._id === action.payload.roomId
      );
      if (index !== -1) {
        state.list[index].status = action.payload.status;
        if (state.activeRoom?._id === action.payload.roomId) {
          state.activeRoom.status = action.payload.status;
        }
      }
    },


    updateCount: (
      state,
      action: PayloadAction<{ roomId: string; userId: string; count: number }>
    ) => {
      const { roomId, userId, count } = action.payload;
      let room = state.list.find(r => r._id === roomId);
      if (room) {
        const participant = room?.participants?.find(p => p?._id == userId);
        if (participant) {
          participant.unreadCount = typeof count === "number" ? count : 0;
          room.unreadCount = typeof count === "number" ? count : 0;
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
      action: PayloadAction<{
        roomId: string;
        message?: Message;
        shouldUpdateLastMessage?: boolean;
        room?: ChatRoom
      }>
    ) => {
      const { roomId, message, shouldUpdateLastMessage, room: LastRoomMessage } = action.payload;

      const index = state.list.findIndex((r) => r._id === roomId);
      if (index === -1 || !message) return;

      const room = state.list[index];

      if (!message.isDeleted && !message.isEdited) {
        room.lastMessageMeta = {
          _id: message._id,
          sender: message.sender?._id,
          text: LastRoomMessage?.lastMessageMeta?.text || '',
          createdAt: message.createdAt,
        };
      }

      if ((shouldUpdateLastMessage && message?.isDeleted) || (shouldUpdateLastMessage && message?.isEdited)) {

        if (room.lastMessageMeta) {
          room.lastMessageMeta.text = LastRoomMessage?.lastMessageMeta?.text || '';
        }
      }

      // 🔥 Move room to top
      state.list.splice(index, 1);
      state.list.unshift(room);
    },


    updateUserPresence: (
      state,
      action: PayloadAction<{
        userId: string;
        isOnline: boolean;
        lastActive?: number;
      }>
    ) => {
      const { userId, isOnline, lastActive } = action.payload;

      // ✅ update list
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

      // ✅ update activeRoom ALSO (THIS WAS MISSING)
      if (state.activeRoom) {
        state.activeRoom = {
          ...state.activeRoom,
          participants: state.activeRoom.participants.map((p) =>
            p._id === userId
              ? {
                ...p,
                isOnline,
                lastActive: lastActive ?? p.lastActive,
              }
              : p
          ),
        };
      }
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
        participants: room?.participants?.map((p: IParticipant) => {
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

    ClearActiveRoom: (state) => {
      state.activeRoom = null;
    },

    clearChatList: () => initialState,
  },
});

export const {
  ClearActiveRoom,
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
  setActiveRoom,
  updateBlockedUser,
  updateUnBlockedUser,
} = chatListSlice.actions;

export default chatListSlice.reducer;
