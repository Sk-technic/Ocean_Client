import { store } from "../../store";
import { getSocket } from "../../api/config/socketClient";
import { updateUserPresence, setBulkPresence } from "../../store/slices/chatList";

let presenceListenerAttached = false;
let lastSyncDone = false;

export const setupPresenceListener = () => {
  if (presenceListenerAttached) return;
  presenceListenerAttached = true;

  const socket = getSocket();
  if (!socket) {
    console.warn("⚠️ Socket not initialized yet");
    return;
  }

  // console.log("⚙️ Presence listener attached ✅");

  socket.on("user:status:update", (payload) => {
    const { userId, status, lastActive } = payload;
    // console.log("📡 PRESENCE UPDATE RECEIVED:", payload);

    store.dispatch(
      updateUserPresence({
        userId,
        isOnline: status === "online",
        lastActive: typeof lastActive === "number" ? lastActive : Date.now(),
      })
    );
  });

  // 🔹 When socket connects (e.g. after refresh or reconnect)
  socket.on("connect", () => {
    // console.log(`🟢 Presence socket connected: ${socket.id}`);
    trySyncPresence();
  });

  // 🔹 Also re-sync when Redux chat list updates
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    const chatRooms = state.chat.list;
    const socketReady = socket.connected;

    if (!lastSyncDone && socketReady && chatRooms.length > 0) {
      console.log("🔁 Redux chat list updated — syncing presence now");
      lastSyncDone = true;
      trySyncPresence();
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("❌ Presence socket disconnected:", reason);
    lastSyncDone = false; // reset for next reconnect
  });

  // 🔹 Heartbeat to keep connection alive
  setInterval(() => {
    if (socket.connected) socket.emit("user:heartbeat");
  }, 60000);

  window.addEventListener("beforeunload", unsubscribe);
};

// 🔸 Emit fresh online status request
const trySyncPresence = () => {
  const socket = getSocket();
  const state = store.getState();
  const chatRooms = state.chat.list;

  if (!socket?.connected) {
    console.warn("⚠️ Socket not connected, skipping presence fetch");
    return;
  }

  if (!chatRooms || chatRooms.length === 0) {
    console.warn("⚠️ No chat rooms found yet, waiting for data...");
    return;
  }

  const allIds = chatRooms.flatMap((room) =>
    room.participants.map((p) => p._id)
  );

  // console.log("📡 Requesting online statuses for:", allIds);

  socket.emit(
    "user:get_online_users",
    allIds,
    (statuses: { userId: string; isOnline: boolean; lastActive?: number | null }[]) => {
      // console.log("📨 Received statuses from backend:", statuses);

      if (Array.isArray(statuses) && statuses.length > 0) {
        const sanitized = statuses.map((s) => ({
          userId: s.userId,
          isOnline: s.isOnline,
          lastActive: typeof s.lastActive === "number" ? s.lastActive : Date.now(),
        }));

        store.dispatch(setBulkPresence(sanitized));
        // console.log("✅ Presence synced successfully after refresh/reconnect");
      } else {
        console.warn("⚠️ Invalid or empty statuses response:", statuses);
      }
    }
  );
};
