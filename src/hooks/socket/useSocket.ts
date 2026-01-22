import { useCallback, useEffect, useRef } from "react";
import { setSocket, setConnected } from "../../store/slices/socketSclice";
import { useAppDispatch } from "../../store/hooks";
import {
  connectSocket,
  disconnectSocket,
  reconnectSocket,
  getSocket,
} from "../../api/config/socketClient";

export const useSocket = (token: string, userId?: string) => {
  const dispatch = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (!token || !userId || initialized.current) return;
    initialized.current = true;

    console.log("⚙️ [useSocket] Initializing socket...");

    const socket = connectSocket(token, userId);
    if (!socket) return;

    dispatch(setSocket(socket));

    const handleConnect = () => {
      console.log("🟢 [useSocket] Connected:", socket.id);
      dispatch(setConnected(true));
    };

    const handleDisconnect = () => {
      // console.warn("🔴 [useSocket] Disconnected:", reason);
      dispatch(setConnected(false));
    };

    const handleError = (err: any) => {
      console.error("💥 [useSocket] Connection Error:", err);
      dispatch(setConnected(false));
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleError);

    // If socket already connected instantly
    if (socket.connected) {
      console.log("⚡ [useSocket] Socket already connected — syncing Redux");
      dispatch(setConnected(true));
    }

    return () => {
      if (!token || !userId) {
        console.log("🔌 [useSocket] Disconnecting due to logout or invalid token");
        disconnectSocket();
        dispatch(setSocket(null));
        dispatch(setConnected(false));
        initialized.current = false;
      } else {
        console.log("⚡ [useSocket] Keeping socket alive during re-render");
      }
    };
  }, [token, userId, dispatch]);

  useCallback(
    (newToken?: string) => {
      console.log("♻️ [useSocket] Manual reconnect...");
      reconnectSocket(newToken ?? token, userId);
    },
    [token, userId]
  );

  return { socket: getSocket() };
};
