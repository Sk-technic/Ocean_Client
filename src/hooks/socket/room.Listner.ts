import { getSocket } from "../../api/config/socketClient";
import { store } from "../../store";
import {
  addChatRoom,
  updateCount,
  updateLastMessage,
} from "../../store/slices/chatList";
import { queryClient } from "../../api/config/queryClient";

let initialized = false;

export function initRoomListener() {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();
  if (!socket) return;

  const updateRoomWithDeleteMessage = (data: any) => {
    store.dispatch(
      updateLastMessage({
        roomId: data?.roomId.toString(),
        shouldUpdateLastMessage: data?.shouldUpdateLastMessage,
        message: data?.message,
        room: data?.room
      })
    );
  };

  socket.on("chat:room_updated", updateRoomWithDeleteMessage);

  socket.on("room:update", (data: any) => {
    console.log(data);

    const room = data?.room;
    const message = data?.message;
    // const tempId = data?.tempId;

    store.dispatch(addChatRoom(room));
    store.dispatch(
      updateLastMessage({
        roomId: room?._id.toString(),
        message,
        room:data?.room,
        shouldUpdateLastMessage: data?.shouldUpdateLastMessage,
      })
    );

    const loggedInUser = store.getState().auth.user;
    const activeroom = store.getState().chat.activeRoom
    const lists = store.getState().chat.list

    let myState = lists.find((u)=>u?._id == data?.room?._id)

    let newCount = Number(myState?.unreadCount)+1
if(activeroom?._id !== data?.roomId){

  store.dispatch(
    updateCount({
      roomId: room?._id,
      userId: loggedInUser?._id!,
      count: newCount,
    })
  );
}
  });
}
