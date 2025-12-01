import { getSocket } from "../../api/config/socketClient";
import { store } from "../../store";
import { updateCount, updateLastMessage } from "../../store/slices/chatList";

let initialized = false;

export function initRoomListener() {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();
  if (!socket) return;

  console.log("🔥 Room listener initialized");

  socket.on("room:update", (room: any, message: any) => {
    console.log("📩 room:update received:", room._id);

    // dispatch without hooks
    store.dispatch(updateLastMessage({ roomId: room._id, message }));

    // get logged in user from Redux (no hooks)
    const loggedInUser = store.getState().auth.user;

    const myState = room.participants.find(
      (p: any) => p.user === loggedInUser?._id
    );

    store.dispatch(
      updateCount({
        roomId: room._id,
        userId: loggedInUser?._id || "",
        count: myState?.unreadCount ?? 0,
      })
    );
  });
}
