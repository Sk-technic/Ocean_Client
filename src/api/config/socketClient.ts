import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
let socket: Socket | null = null;

/**
 * Initialize a new socket connection
 */
export const connectSocket = (token?: string, userId?: string) => {
  if (!token) {
    console.warn("⚠️ [Socket] Token missing — skipping connection");
    return null;
  }

  if (!SOCKET_URL) {
    console.error("❌ [Socket] Missing SOCKET_URL in .env");
    return null;
  }

  if (!socket) {
    console.log("🔌 [Socket] Initializing new socket connection...");

    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1500,
      auth: { token, userId }, 
    });

    // socket.on("connect", () =>
    //   console.log(`🟢 [Socket] Connected: ${socket?.id}`)
    // );

    // socket.on("disconnect", (reason) =>
    //   console.warn(`🔴 [Socket] Disconnected: ${reason}`)
    // );

    // socket.on("connect_error", (err) =>
    //   console.error("⚠️ [Socket] Connection failed:", err.message)
    // );

    socket.connect();
  }

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Gracefully disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    console.log("🔌 [Socket] Disconnecting...");
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};

/**
 * Reconnect socket with a new token (e.g. after refresh)
 */
export const reconnectSocket = (newToken: string, userId?: string) => {
  if (!newToken) {
    console.warn("⚠️ [Socket] No token provided for reconnect");
    return;
  }

  if (socket) {
    console.log("♻️ [Socket] Reconnecting with new token...");

    socket.removeAllListeners();

    socket.auth = { token: newToken, userId };
    socket.disconnect();

    setTimeout(() => {
      socket?.connect();
    }, 300);

    socket.on("connect", () =>
      console.log(`🟢 [Socket] Reconnected: ${socket?.id}`)
    );
    socket.on("disconnect", (reason) =>
      console.warn(`🔴 [Socket] Disconnected: ${reason}`)
    );
    socket.on("connect_error", (err) =>
      console.error("⚠️ [Socket] Reconnection failed:", err.message)
    );

    return socket;
  }

  console.log("🔁 [Socket] No existing socket — creating new connection...");
  return connectSocket(newToken, userId);
};
