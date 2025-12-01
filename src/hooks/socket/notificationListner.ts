import { getSocket } from "../../api/config/socketClient";
import { store } from "../../store";
import { addNotification } from "../../store/slices/notification/notificationSlice";

let initialized = false;

export function initNotificationListener() {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();
  if (!socket) return;

  console.log("🔥 Room listener initialized");

  socket.on("new:notification", (notification:any) => {
    console.log("notification",notification?.notification);
    
    store.dispatch(addNotification({singleNotification:notification?.notification}));
  });
}
