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
import { useCallSignaling } from "./hooks/call/useCallSignaling";
import IncomingCallModal from "./layout/ChatLayout/Components/call/IncomingCall";
// import type { StartCallPayload } from "./layout/ChatLayout/Components/ChatHeader";
import CallStreamWindow from "./layout/ChatLayout/Components/call/CallStreamWindow";
import { clearActiveCall, setActiveCall } from "./store/slices/activeCallSlice";
import type { ICallingUser } from "./layout/ChatLayout/ChatLayout";

const App = () => {
  const dispatch = useDispatch();

  const { isConnected } = useSelector((state: RootState) => state.socket);
  const { isAuthenticated, user: loggedInUser, accessToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [menu, setmenu] = useState<boolean>(false);
  const [incomingGroupCall, setIncomingGroupCall] = useState<any>(null)
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
  // useChatUsers(loggedInUser?._id, isConnected && isAuthenticated);
  useChatUsers(loggedInUser?._id);

  

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


  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // const [outGoingCall, setOutGoingCall] = useState<StartCallPayload | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [fullScreen, setFullScreen] = useState<boolean>(true);
  const [maxScreen, setMaxScreen] = useState<boolean>(false);

  const [callWindow, setCallWindow] = useState<boolean>(false)
  const socket = getSocket()
  useCallSignaling({
    onGroupCallNotify(payload) {
      console.log("📢 Group call notify:", payload);
      setIncomingGroupCall({
        ...payload,
        type: "group",
      });
    },
    onIncomingCall(payload) {
      console.log("📞 Incoming DM call:", payload);

      setIncomingCall({
        ...payload,
        type: "dm",
      });
    },
    onCallCancelled() {
      setIncomingCall(null);
      setIncomingGroupCall(null)
    },
    onCallRejected() {
      // setOutGoingCall(null)
      setIncomingCall(null)
    },
    onhandleAccepted(payload: { roomId: string, acceptedBy: ICallingUser }) {
      console.log("------------------Accept Call : ", payload,);

      if (payload) {
        dispatch(setActiveCall({
          roomId: payload?.roomId,
          roomType: "dm",
          remoteUser: payload.acceptedBy
        }))
        setCallWindow(true)
        // setOutGoingCall(null)
      }
    },
  })

  useEffect(() => {
    if (!socket) return
    const handleCallEnded = (payload: any) => {
      console.log("payload ==== call ended", payload);
      dispatch(clearActiveCall())
      setCallWindow(false)
    }
    socket?.on("call:ended", handleCallEnded)

    return () => {
      socket?.off("call:ended", handleCallEnded)

    }
  }, [socket])

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
      className={`relative w-full flex h-screen overflow-hidden ${theme === "dark" || theme === "light"
        ? "theme-bg-primary"
        : "bg-stone-100"
        }`}
    >

      {
        (incomingGroupCall || incomingCall) &&
        <IncomingCallModal data={incomingGroupCall ? incomingGroupCall : incomingCall} onClose={() => incomingGroupCall ? setIncomingGroupCall(null) : setIncomingCall(null)} />
      }

      {
        callWindow && (
          <section className="fixed inset-0 pointer-events-none z-[1000]  flex items-center justify-center w-full overflow-hidden">
            <CallStreamWindow
              setFullScreen={setFullScreen}
              fullScreen={fullScreen}
              setMaxScreen={setMaxScreen}
              maxScreen={maxScreen}
            />
          </section>
        )
      }
      <div
        className={`
          fixed z-[999] transition-all duration-300 ease-in-out
          bottom-16 left-2
          md:bottom-14 md:left-1
          ${menu
            ? "opacity-100 translate-x-0 "
            : " -translate-x-70 opacity-50 pointer-events-none"
          }
        `}
      >
        <AccountMenu onSetMenu={setmenu} />
      </div>

      <main className="flex h-screen w-full">
        {isAuthenticated && (
          <div
            className={`
              z-[777]
              fixed
              md:static
              bottom-0 left-0 w-full h-16
              md:top-0 md:left-0 md:h-full md:w-fit
              ${theme === "dark" || theme === "system"
                ? "theme-bg-primary"
                : "bg-stone-100"
              }
            `}
          >
            <Sidebar setmenu={setmenu} />
          </div>
        )}

        <div className="flex-1 pb-16 md:pb-0 w-full overflow-hidden">
          <Outlet />
        </div>

        <Notify />

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
