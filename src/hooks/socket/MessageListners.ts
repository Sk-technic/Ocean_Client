import { getSocket } from "../../api/config/socketClient";
import { store } from "../../store";
import { acceptMessageRequest } from "../../store/slices/chatList";
import type { ChatRoom } from "../../types/chat";

let initialized = false;

export function initMessageListner() {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();
  if (!socket) return;

  console.log("🔥 Message listener initialized");

  socket.on("accept:message_request:success", (room:ChatRoom) => {
    console.log("room",room);
    
    store.dispatch(acceptMessageRequest({roomId:room?._id,status:room?.status}))
  });
}
