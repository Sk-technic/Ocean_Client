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

  socket.on("accept:message_request:success", (data:ChatRoom) => {
    console.log("room",data);
    
    store.dispatch(acceptMessageRequest({roomId:data?._id,status:data?.status}))
  });
}
