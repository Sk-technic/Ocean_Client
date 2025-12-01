import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Socket } from "socket.io-client";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
}

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocket: (state, action: PayloadAction<Socket | null>) => {
      state.socket = action.payload as any;
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    resetSocket: () => initialState,
  },
});

export const { setSocket, setConnected, resetSocket } = socketSlice.actions;
export default socketSlice.reducer;
