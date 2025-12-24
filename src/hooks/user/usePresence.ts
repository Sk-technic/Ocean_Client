// import { useEffect, useState, useMemo } from "react";
// import { getSocket } from "../../api/config/socketClient";


// export const usePresence = (userIds: string[] = []) => {
//   const socket = useMemo(() => getSocket(), []);
//   const [onlineMap, setOnlineMap] = useState<Record<string, boolean>>({});
//   console.log("userIds:", userIds);

//   // ✅ Fetch initial presence info
//   useEffect(() => {
//     if (!socket || userIds.length === 0) return;

//     socket.emit("user:get_online_users", userIds, (response: any[]) => {
//       const map: Record<string, boolean> = {};
//       response.forEach(({ userId, isOnline }) => {
//         map[userId] = isOnline;
//       });
//       setOnlineMap(map);
//     });
//   }, [socket, userIds]);

//   // ✅ Real-time status updates
//   useEffect(() => {
//     const handleStatusUpdate = ({
//       userId,
//       status,
//     }: {
//       userId: string;
//       status: "online" | "offline";
//     }) => {
//       // Only update if the user is in our list
//       if (!userIds.includes(userId)) return;
//       setOnlineMap((prev) => ({
//         ...prev,
//         [userId]: status === "online",
//       }));
//     };

//     socket?.on("user:status:update", handleStatusUpdate);
//     return () => {
//       socket?.off("user:status:update", handleStatusUpdate);
//     };
//   }, [socket, userIds]);

//   return onlineMap;
// };
