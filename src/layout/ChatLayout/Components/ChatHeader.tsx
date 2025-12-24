import React, { useEffect, useMemo, useState } from "react";
import type { IParticipant } from "../../../types/chat";
import { useAppSelector } from "../../../store/hooks";
import { CiVideoOn, CiPhone } from "react-icons/ci";
import { useTimeAgo } from "../../../utils/timecoverter";
import { getSocket } from "../../../api/config/socketClient";
import TypingIndicator from "../../../utils/TypingWave";
import { TbMenu4 } from "react-icons/tb";
import { optimizeUrl } from "../../../utils/imageOptimize";

interface ChatHeaderProps {
  onSetSlide: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onSetSlide }) => {
  const socket = getSocket();
  const [imageLoaded, setImageLoaded] = useState(true);

  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const { activeRoom, list } = useAppSelector((state) => state.chat);
  const { user: dmUser } = useAppSelector((state) => state.user);

  const [typingUsers, setTypingUsers] = useState<
    { id: string; name: string }[]
  >([]);

  /* ---------------- Typing Indicator ---------------- */
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
    return () => {
      socket.off("typing:update", handler)
    };
  }, [socket, activeRoom?._id, loggedInUser?._id]);

  /* ---------------- Active Chat User (DM only) ---------------- */
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

  const lastActiveText = useTimeAgo(activeChat?.lastActive)
  /* ---------------- Avatar Source ---------------- */
  const avatarSrc = optimizeUrl(
    activeChat?.profilePic || activeRoom?.avatar || dmUser?.profilePic || "",
    200
  ) || "/profile-dummy.png";

  return (
    <header className=" w-[99%] bg-transparent  backdrop-blur-3xl shadow-sm rounded-full border-5 theme-border flex items-center p-[1px] justify-between">
      <main className="relative  flex w-full items-center justify-between rounded-full">

        <div className="flex items-center gap-2 hover:cursor-pointer">
          {/* Avatar */}
          <div className="relative rounded-full flex items-center justify-center p-1">
            {imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded-full" />
            )}

            <img
              src={avatarSrc}
              onLoad={() => setImageLoaded(false)}
              alt="User avatar"
              loading="lazy"
              className={`rounded-full border theme-border md:w-12 md:h-12 w-8 h-8 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-0" : "opacity-100"
                }`}
            />
          </div>

          {/* Name & Status */}
          <div className="flex flex-col justify-center">
            {(!activeRoom && !dmUser) ? (
              <>
                <div className="h-3 w-32 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded mb-1" />
                <div className="h-2 w-16 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded" />
              </>
            ) : (
              <>
                <h2 className="text-[14px] font-semibold">
                  {activeRoom?.type === "dm"
                    ? activeChat?.username || dmUser?.username
                    : activeRoom?.name || dmUser?.username}
                </h2>

                {!activeRoom?.blockedMe ? (
                  typingUsers.length > 1 ? (
                    <TypingIndicator />
                  ) : (activeChat?.isOnline) ? (
                    <p className="text-[12px] text-disable">online</p>
                  ) : (
                    <p className="text-[12px] font-semibold text-disable">
                      {dmUser ? dmUser.fullName : lastActiveText}
                    </p>
                  )
                ) : (
                  <p className="theme-text-muted text-[12px] font-medium">
                    You blocked this user
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 theme-text-muted mr-10">
          <div className="rounded-xl p-1 theme-hover-effect cursor-pointer">
            <CiPhone size={25} />
          </div>
          <div className="rounded-xl p-1 theme-hover-effect cursor-pointer">
            <CiVideoOn size={25} />
          </div>
          <div
            onClick={() => onSetSlide((prev) => !prev)}
            className="rounded-xl p-1 theme-hover-effect cursor-pointer"
          >
            <TbMenu4 size={25} />
          </div>
        </div>
      </main>
    </header>
  );
};

export default ChatHeader;
