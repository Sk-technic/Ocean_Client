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

socket.on("new:notification", (data) => {
    console.log("🔥 SOCKET DATA:", data);

    const singleNotification = data.notification;

    if (!singleNotification) {
        console.warn("⚠ No notification found in payload");
        return;
    }

    singleNotification.createdAt = new Date(singleNotification.createdAt).toISOString();

    store.dispatch(addNotification({ singleNotification }));
});


}
