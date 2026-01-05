import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ActiveCallState {
  roomId: string | null;
  roomType: "dm" | "group" | null;
  callType?: "audio" | "video" | null;

  /**
   * The OTHER user (DM)
   * or primary display user (group)
   */
  remoteUser: {
    id?: string|undefined;
    name: string;
    avatar?: string|undefined;
  } | null;

  status: "idle" | "calling" | "ringing" | "connected";
}

const initialState: ActiveCallState = {
  roomId: null,
  roomType: null,
  callType: null,
  remoteUser: null,
  status: "idle",
};

const activeCallSlice = createSlice({
  name: "activeCall",
  initialState,
  reducers: {
    setActiveCall(
      state,
      action: PayloadAction<{
        roomId: string;
        roomType: "dm" | "group";
        callType?: "audio" | "video";
        remoteUser?: ActiveCallState["remoteUser"];
      }>
    ) {
      state.roomId = action.payload.roomId;
      state.roomType = action.payload.roomType;
      state.callType = action.payload?.callType||null;
      state.remoteUser = action.payload.remoteUser || null;
      state.status = "connected";
    },

    /** 🟡 For outgoing / incoming UI */
    setCallStatus(
      state,
      action: PayloadAction<ActiveCallState["status"]>
    ) {
      state.status = action.payload;
    },

    /** 🔴 Call end / cleanup */
    clearActiveCall(state) {
      state.roomId = null;
      state.roomType = null;
      state.callType = null;
      state.remoteUser = null;
      state.status = "idle";
    },
  },
});

export const {
  setActiveCall,
  setCallStatus,
  clearActiveCall,
} = activeCallSlice.actions;

export default activeCallSlice.reducer;
