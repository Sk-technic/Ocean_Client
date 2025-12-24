import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { queryUser, User } from "../../types";

interface UserPresence {
  status: "online" | "away" | "offline";
  timestamp: string;
}

interface UserState {
  user: queryUser | User | null;
  isLoading: boolean;
  roomId: string | null;
  presences: Record<string, UserPresence>;
}

const initialState: UserState = {
  user: null,
  isLoading: true,
  roomId: null,
  presences: {}, // initially empty
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setqueryUser: (state, action: PayloadAction<queryUser|User>) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateStatus: (
      state,
      action: PayloadAction<{ userId: string; status: "online" | "away" | "offline"; timestamp: string }>
    ) => {
      state.presences[action.payload.userId] = {
        status: action.payload.status,
        timestamp: action.payload.timestamp,
      };
    },
  },
});

export const { setqueryUser, clearUser, setRoomId, updateStatus } = userSlice.actions;
export default userSlice.reducer;
