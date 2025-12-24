import { store } from "../../store";
import { getSocket } from "../../api/config/socketClient";
import {
  updateUserPresence,
  setBulkPresence,
} from "../../store/slices/chatList";
import type { IParticipant } from "../../types/chat";

/**
 * Used to avoid unnecessary bulk re-sync
 */
let lastPresenceIdsKey = "";

/**
 * Stable handler references (VERY IMPORTANT)
 */
const handlePresenceUpdate = (payload: {
  userId: string;
  status: "online" | "offline";
  lastActive?: number;
}) => {

    console.log("🟡 PRESENCE EVENT RECEIVED:", payload); // 👈 ADD THIS

  const { userId, status, lastActive } = payload;

  store.dispatch(
    updateUserPresence({
      userId,
      isOnline: status === "online",
      lastActive,
    })
  );
};

const handleReconnect = () => {
  lastPresenceIdsKey = "";
  trySyncPresence();
};

/**
 * Call ONCE after socket is connected
 * (eg. after login / app bootstrap)
 */
export const setupPresenceListener = () => {
  const socket = getSocket();
  if (!socket) return;

  // 🔥 attach with stable refs
  socket.off("user:status:update", handlePresenceUpdate);
  socket.on("user:status:update", handlePresenceUpdate);

  socket.off("connect", handleReconnect);
  socket.on("connect", handleReconnect);
};

/**
 * Cleanup on logout / app destroy
 */
export const cleanupPresenceListener = () => {
  const socket = getSocket();
  if (!socket) return;

  socket.off("user:status:update", handlePresenceUpdate);
  socket.off("connect", handleReconnect);

  lastPresenceIdsKey = "";
};

/**
 * One-time or reconnect bulk presence sync
 * (reads from Redis via socket)
 */
const trySyncPresence = () => {
  const socket = getSocket();
  if (!socket || !socket.connected) return;

  const state = store.getState();
  const chatRooms = state.chat.list;
  const selfId = state.auth.user?._id;

  if (!chatRooms?.length) return;

  const userIds = Array.from(
    new Set(
      chatRooms
        .flatMap((r) => r.participants?.map((p: IParticipant) => p._id))
        .filter((id) => id && id !== selfId)
    )
  );

  if (!userIds.length) return;

  // prevent unnecessary re-fetch
  const key = userIds.slice().sort().join(",");
  if (key === lastPresenceIdsKey) return;

  lastPresenceIdsKey = key;

  socket.emit(
    "user:get_online_users",
    userIds,
    (statuses: Array<{
      userId: string;
      isOnline: boolean;
      lastActive?: number;
    }>) => {
      if (!Array.isArray(statuses)) return;

      store.dispatch(
        setBulkPresence(
          statuses.map((s) => ({
            userId: s.userId,
            isOnline: s.isOnline,
            lastActive:
              typeof s.lastActive === "number"
                ? s.lastActive
                : undefined,
          }))
        )
      );
    }
  );
};
