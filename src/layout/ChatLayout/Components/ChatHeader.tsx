import React, { useEffect, useMemo, useState } from "react";
import type { IParticipant } from "../../../types/chat";
import { useAppSelector } from "../../../store/hooks";
import { CiVideoOn, CiPhone } from "react-icons/ci";
import { useTimeAgo } from "../../../utils/timecoverter";
import { getSocket } from "../../../api/config/socketClient";
import TypingIndicator from "../../../utils/TypingWave";
import { TbMenu4 } from "react-icons/tb";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { useCallSignaling } from "../../../hooks/call/useCallSignaling";

/* ================= TYPES ================= */

export interface StartCallPayload {
  roomId: string;
  roomType: "dm" | "group";
  callType: "audio" | "video";

  caller: {
    id: string;
    name: string;
    avatar?: string;
  };

  receiver: {
    id?: string; // dm only
    name: string;
    avatar?: string;
  };
}

interface ChatHeaderProps {
  onSetSlide: React.Dispatch<React.SetStateAction<boolean>>;
  onStartCall: (payload: StartCallPayload) => void;
}

/* ================= COMPONENT ================= */

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onSetSlide,
  onStartCall,
}) => {
  const socket = getSocket();
  const [imageLoaded, setImageLoaded] = useState(true);

  const { activeRoom, list } = useAppSelector((s) => s.chat);
  const { user: dmUser } = useAppSelector((s) => s.user);
  const {user:loggedInUser} = useAppSelector(state=>state.auth)
  const [typingUsers, setTypingUsers] = useState<
    { id: string; name: string }[]
  >([]);

  /* ================= Typing Indicator ================= */

  useEffect(() => {
    if (!socket || !activeRoom?._id) return;

    const handler = ({ roomId, typingUsers }: any) => {
      if (roomId === activeRoom._id) {
        setTypingUsers(
          typingUsers.filter(
            (u: { id: string }) => u.id !== loggedInUser?._id
          )
        );
      }
    };

    socket.on("typing:update", handler);
    return () => {socket.off("typing:update", handler)};
  }, [socket, activeRoom?._id, loggedInUser?._id]);

  /* ================= Active Chat (DM only) ================= */

  const activeChat: IParticipant | null = useMemo(() => {
    if (!activeRoom || activeRoom.type !== "dm" || !loggedInUser?._id) {
      return null;
    }

    const roomFromList = list.find((r) => r._id === activeRoom._id);
    if (!roomFromList) return null;

    return (
      roomFromList.participants.find(
        (p) => p._id !== loggedInUser._id
      ) || null
    );
  }, [activeRoom, list, loggedInUser?._id]);

  const lastActiveText = useTimeAgo(activeChat?.lastActive);

  // const participant = activeRoom?.participants?.find(
  //   (u) => u?._id !== loggedInUser?._id
  // );

  /* ================= Avatar ================= */

  const avatarSrc =
    optimizeUrl(
      activeRoom?.type === "dm"
        ? activeChat?.profilePic || dmUser?.profilePic ||''
        : activeRoom?.avatar||'',
      200
    ) || "/profile-dummy.png";

  /* ================= CALL HANDLER (SINGLE SOURCE) ================= */
  const {startCall} = useCallSignaling()
  const handleCall = (callType: "audio" | "video") => {
  if (!activeRoom || !loggedInUser) return;

  const participant = activeRoom.participants?.find(
    (u) => u._id !== loggedInUser._id
  );

  const payload: StartCallPayload = {
    roomId: activeRoom._id,
    roomType: activeRoom.type,
    callType,

    caller: {
      id: loggedInUser._id,
      name: loggedInUser.username || loggedInUser.fullName || "User",
      avatar: loggedInUser.profilePic,
    },

    receiver:
      activeRoom.type === "dm"
        ? {
            id: participant?._id,
            name: participant?.username || participant?.fullName || "User",
            avatar: participant?.profilePic,
          }
        : {
            name: activeRoom.name || "Group Call",
            avatar: activeRoom.avatar,
          },
  };
  startCall(payload)
  onStartCall(payload);
};


  /* ================= UI ================= */

  return (
    <header className="w-[99%] backdrop-blur-3xl shadow-sm rounded-full border-3 theme-border flex items-center p-[1px] justify-between">
      <main className="flex w-full items-center justify-between rounded-full">

        {/* LEFT */}
        <div className="flex items-center gap-2  w-fit cursor-pointer">
          <div className="relative rounded-full p-1">
            {imageLoaded && (
              <div className="absolute inset-0 bg-zinc-700 animate-pulse rounded-full" />
            )}
            <img
              src={avatarSrc}
              onLoad={() => setImageLoaded(false)}
              className={`rounded-full md:w-12 md:h-12 w-8 h-8 object-cover ${
                imageLoaded ? "opacity-0" : "opacity-100"
              }`}
              alt="avatar"
            />
          </div>

          <div className="flex flex-col">
            <h2 className="text-sm font-normal">
              {activeRoom?.type === "dm"
                ? activeChat?.username || dmUser?.username
                : activeRoom?.name}
            </h2>

            {/* STATUS */}
            {typingUsers.length > 0 ? (
              <span className="text-[10px] flex items-center gap-1">
                <TypingIndicator />
                {typingUsers.length <= 3 ? (
                  <>
                    {typingUsers.map((u, i) => (
                      <span key={i}>
                        {u.name}
                        {i < typingUsers.length - 1 && ","}
                      </span>
                    ))}
                    <span>
                      {typingUsers.length === 1
                        ? " is typing..."
                        : " are typing..."}
                    </span>
                  </>
                ) : (
                  <span>users are typing...</span>
                )}
              </span>
            ) : activeChat?.isOnline ? (
              <span className="text-xs text-lime-500">online</span>
            ) : (
              <span className="text-xs w-120  theme-text-muted">
                {activeRoom?.description || lastActiveText}
              </span>
            )}
          </div>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-3 mr-6 ">
          <CiPhone
            size={25}
            className="cursor-pointer"
            onClick={() => handleCall("audio")}
          />
          <CiVideoOn
            size={25}
            className="cursor-pointer"
            onClick={() => handleCall("video")}
          />
          <TbMenu4
            size={25}
            className="cursor-pointer"
            onClick={() => onSetSlide((p) => !p)}
          />
        </div>
      </main>
    </header>
  );
};

export default ChatHeader;
