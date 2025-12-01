import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/Navbar/Navbar";
import type { RootState } from "./store";
import { useAuthInit } from "./hooks/auth/authHooks";
import Notify from "./utils/Notify";
import { useEffect, useState } from "react";
import { useSocket } from "./hooks/socket/useSocket";
import { setupPresenceListener } from "./hooks/socket/presenceListner";
import { useChatUsers } from "./hooks/chat/chatHook";
import { getSocket } from "./api/config/socketClient";
import { setConnected } from "./store/slices/socketSclice";
import { initSocketListeners } from "./hooks/socket";
import AccountMenu from "./components/menu/AccountMenu";
import { useGetNotification } from "./hooks/notifications/notifications";

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  const { isConnected } = useSelector((state: RootState) => state.socket);
  const [loading, setLoading] = useState(true);

  useAuthInit();
  useSocket(accessToken || "", user?._id);
  useChatUsers(isAuthenticated ? user?._id : undefined, isConnected);
  useGetNotification(user?._id!)
  useEffect(() => {
    const socket = getSocket();
    if (socket?.connected && !isConnected) {
      dispatch(setConnected(true));
    }
  }, [isConnected, dispatch]);

  useEffect(() => {
    if (isConnected && isAuthenticated) {
      setupPresenceListener();
    }
  }, [isConnected, isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
  initSocketListeners();
}, []);

const [menu,setmenu] = useState<boolean>(false)
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg-primary)] transition-all duration-700">
        <h1 className="text-4xl font-bold text-[var(--accent-primary)] animate-pulse tracking-wide">
          Ocean
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2 animate-fadeIn">
          Loading your experience...
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-screen flex h-screen overflow-hidden">
      {isAuthenticated && (
        <div className="flex justify-center items-center pl-3 pt-3 pb-3">
          <Sidebar setmenu={setmenu}/>
        </div>
        
      )}
        { menu &&
          <AccountMenu onSetMenu={setmenu}/>
        }
      <main className="flex-1 transition-all duration-300 relative">
        <Outlet />
        <Notify />
        {isAuthenticated && (
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
