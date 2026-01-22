import { initMessageListner } from "./MessageListners";
import { initNotificationListener } from "./notificationListner";
import { initRoomListener } from "./room.Listner";

let initialized = false;

export function initSocketListeners() {
  if (initialized) return;
  initialized = true;

 initRoomListener()
 initNotificationListener()
 initMessageListner()
}
