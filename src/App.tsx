import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "./components/Navbar/Navbar";
import type { RootState } from "./store";
import { useAuthInit } from "./hooks/auth/authHooks";
import Notify from "./utils/Notify";
import { useEffect, useState } from "react";
import { useSocket } from "./hooks/socket/useSocket";
import {
  cleanupPresenceListener,
  setupPresenceListener,
} from "./hooks/socket/presenceListner";
import { useChatUsers } from "./hooks/chat/chatHook";
import { getSocket } from "./api/config/socketClient";
import { setConnected } from "./store/slices/socketSclice";
import { initSocketListeners } from "./hooks/socket";
import AccountMenu from "./components/menu/AccountMenu";
import { useGetNotification } from "./hooks/notifications/notifications";
import { useTheme } from "./hooks/theme/usetheme";

const App = () => {
  const dispatch = useDispatch();

  const { isConnected } = useSelector((state: RootState) => state.socket);
  const { isAuthenticated, user: loggedInUser, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [menu, setmenu] = useState<boolean>(false);

  /**
   *  Init auth (token restore etc.)
   */
  useAuthInit();

  /**
   *  Socket connect (creates socket instance)
   */
  useSocket(accessToken || "", loggedInUser?._id);

  /**
   *  Detect socket connection and update redux
   */
  useEffect(() => {
    const socket = getSocket();
    if (socket?.connected && !isConnected) {
      dispatch(setConnected(true));
    }
  }, [isConnected, dispatch]);

 
  useEffect(() => {
    if (!isAuthenticated || !isConnected) return;

    console.log("🟢 Attaching presence listener");
    setupPresenceListener();

    return () => {
      console.log("🔴 Cleaning presence listener");
      cleanupPresenceListener();
    };
  }, [isAuthenticated, isConnected]);

  /**
   *  Load chat users after socket + auth ready
   */
  useChatUsers(loggedInUser?._id, isConnected && isAuthenticated);

  /**
   *  Notifications
   */
  useGetNotification(loggedInUser?._id!);

  /**
   *  Init other socket listeners (messages, typing, etc.)
   */
  useEffect(() => {
    if (isConnected) {
      initSocketListeners();
    }
  }, [isConnected]);

  /**
   *  App loader
   */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

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
    <div
      className={`relative w-full flex h-screen overflow-hidden ${
        theme === "dark" || theme === "system"
          ? "theme-bg-primary"
          : "bg-stone-100"
      }`}
    >
      {/* Account Menu */}
      <div
        className={`
          fixed z-[999] transition-all duration-500 ease-in-out
          bottom-16 left-2
          md:bottom-14 md:left-5
          ${
            menu
              ? "opacity-100 translate-y-0 translate-x-0"
              : "opacity-0 translate-y-50 -translate-x-20 pointer-events-none"
          }
        `}
      >
        <AccountMenu onSetMenu={setmenu} />
      </div>

      {/* Main Layout */}
      <main className="flex h-screen w-full">
        {/* Sidebar */}
        {isAuthenticated && (
          <div
            className={`
              z-[777]
              fixed
              md:static
              bottom-0 left-0 w-full h-16
              md:top-0 md:left-0 md:h-full md:w-fit
              ${
                theme === "dark" || theme === "system"
                  ? "theme-bg-primary"
                  : "bg-stone-100"
              }
            `}
          >
            <Sidebar setmenu={setmenu} />
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 pb-16 md:pb-0 w-full overflow-hidden">
          <Outlet />
        </div>

        {/* Notifications */}
        <Notify />

        {/* Socket Status */}
        {isAuthenticated && (
          <div className="fixed bottom-2 right-3 text-xs text-gray-400 z-[1000]">
            Socket: {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
