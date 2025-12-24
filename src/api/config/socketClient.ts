import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

let socket: Socket | null = null;

/**
 * Create or return existing socket instance
 */
export const connectSocket = (token?: string, userId?: string): Socket | null => {
  if (!token) {
    console.warn("[Socket] Token missing, connection skipped");
    return null;
  }

  if (!SOCKET_URL) {
    console.error("[Socket] SOCKET_URL missing");
    return null;
  }

  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket","polling"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      auth: { token, userId },
    });

    socket.connect();
  }

  

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Gracefully disconnect socket (logout / app close)
 */
export const disconnectSocket = () => {
  if (!socket) return;

  socket.disconnect();
  socket = null;
};

/**
 * Reconnect socket with new token (refresh token flow)
 * IMPORTANT: listeners are NOT removed
 */
export const reconnectSocket = (newToken: string, userId?: string): Socket | null => {
  if (!newToken) {
    console.warn("[Socket] Reconnect skipped, token missing");
    return socket;
  }

  if (!socket) {
    return connectSocket(newToken, userId);
  }

  socket.auth = { token: newToken, userId };

  if (socket.connected) {
    socket.disconnect();
  }

  setTimeout(() => {
    socket?.connect();
  }, 300);

  return socket;
};
