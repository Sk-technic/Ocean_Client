import toast from "react-hot-toast";
import { getSocket } from "../../api/config/socketClient";
import { store } from "../../store";
import { addNotification } from "../../store/slices/notification/notificationSlice";
import { optimizeUrl } from "../../utils/imageOptimize";

let initialized = false;

export function initNotificationListener() {
  if (initialized) return;
  initialized = true;

  const socket = getSocket();
  if (!socket) return;

  console.log("🔥 Notification listener initialized");

  socket.on("new:notification", (data) => {
    const singleNotification = data?.notification;
console.log("display notification : ",singleNotification);

    if (!singleNotification) {
      console.warn("⚠ No notification found in payload");
      return;
    }

    store.dispatch(addNotification({ singleNotification }));
  });
}
