import React, { useEffect, useState } from "react";
import type { IParticipant } from "../../../types/chat";
import { useAppSelector } from "../../../store/hooks";
import { CiVideoOn, CiPhone } from "react-icons/ci";
import { useTimeAgo } from "../../../utils/timecoverter";
import { useParams } from "react-router-dom";
import { getSocket } from "../../../api/config/socketClient";
import TypingIndicator from "../../../utils/TypingWave";
import { TbMenu4 } from "react-icons/tb";
import { optimizeUrl } from "../../../utils/imageOptimize";
interface ChatHeaderProps {
  chatUserDetails: IParticipant | null;
  BlockedMe:boolean;
onSetSlide: React.Dispatch<React.SetStateAction<boolean>>

}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatUserDetails,BlockedMe,onSetSlide }) => {
  // console.log(chatUserDetails);

  const socket = getSocket();
  const [imageLoaded, setImageLoaded] = useState(true);
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const { roomId: newRoomUser } = useParams();
  const storeUser = useAppSelector((state) => {
    const allParticipants = state.chat.list.flatMap(
      (room) => room.participants
    );
    return (
      allParticipants.find((p) => p._id === chatUserDetails?._id) || null
    );
  });

  const user = newRoomUser ? chatUserDetails : storeUser;

  const lastActiveText = useTimeAgo(user?.lastActive || null);

  const [typingUsers, setTypingUsers] = useState<
    { id: string; name: string }[]
  >([]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ roomId, typingUsers }: any) => {
      if (roomId === newRoomUser || roomId === chatUserDetails?.roomId) {
        const filtered = typingUsers.filter(
          (u: { id: string; name: string }) => u.id !== loggedInUser?._id
        );
        setTypingUsers(filtered);
      }
    };

    socket.on("typing:update", handler);
    return () => {
      socket.off("typing:update", handler);
    };
  }, [socket, newRoomUser, chatUserDetails?.roomId, loggedInUser?._id]);

  return (
    <header className="relative w-[99%] bg-transparent backdrop-blur-2xl shadow-sm rounded-full border-2 theme-border flex items-center p-1 justify-between">
      <div className="flex items-center gap-2">
        {/* Profile Section */}
        <div className="relative rounded-full flex items-center justify-center">
          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded-full" />
          )}

          <img
            src={optimizeUrl(user?.profilePic || '', 300) || "/profile-dummy.png"}
            onLoad={() => {
              if (user?.profilePic == "" || null) {
                setImageLoaded(true)
              }
              setImageLoaded(false)
            }
            }
            alt="User avatar"
            loading="lazy"
            className={`rounded-full border theme-border md:w-12 md:h-12 w-8 h-8 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-0" : "opacity-100"
              }`}
          />
        </div>

        {/* Name + Status */}
        <div className="flex flex-col justify-center">
          {!user ? (
            <>
              <div className="h-3 w-32 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded mb-1" />
              <div className="h-2 w-16 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded" />
            </>
          ) : (
            <>
              <h2 className="text-[14px] font-semibold">{user.fullName}</h2>

              {!BlockedMe && ((typingUsers.length > 0) ? (
                <TypingIndicator />
              ) : (user.isOnline) ? (
                <p className="text-[13px] text-disable flex items-center">
                  <span className="ml-1">
                    online
                  </span>
                </p>
              ) : (
                <p className="text-[11px] font-semibold text-disable">{`Active ${lastActiveText}`}</p>
              ))}

              {
                BlockedMe && (
                  <p className="theme-text-muted text-[12px] font-medium">Ocean User !</p>
                )
              }
            </>
          )}
        </div>
      </div>

      {/* Right Buttons */}
      <div className=" flex items-center gap-3 theme-text-muted mr-5">
        <div className="rounded-xl p-1 theme-hover-effect cursor-pointer transition-all duration-200">
          <CiPhone size={25} strokeWidth={1}/>
        </div>
        <div className="rounded-xl p-1 theme-hover-effect cursor-pointer transition-all duration-200">
          <CiVideoOn size={25} strokeWidth={1}/>
        </div>
        <div
          onClick={() => onSetSlide((prev)=>!prev)}
          className="rounded-xl p-1 theme-hover-effect cursor-pointer transition-all duration-200"
        >
          <TbMenu4 size={25} strokeWidth={2}/>
        </div>
    
      </div>
    </header>
  );
};

export default ChatHeader;
