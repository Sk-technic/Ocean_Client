import React, { useEffect, useState, useMemo } from "react";
import type { IParticipant } from "../../../types/chat";
import { useAppSelector } from "../../../store/hooks";
import { CiAt, CiVideoOn, CiPhone, CiCircleInfo } from "react-icons/ci";
import { useTimeAgo } from "../../../utils/timecoverter";
import { useParams } from "react-router-dom";
import { getSocket } from "../../../api/config/socketClient";
import TypingIndicator from "../../../utils/TypingWave";
import { CiImageOn, CiSearch } from "react-icons/ci";
import { LuTrash2, LuTrash, LuDownload } from "react-icons/lu";
import { PiImages } from "react-icons/pi";
import { useClearChat } from "../../../hooks/chat/chatEvents";
import { useDispatch } from "react-redux";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { optimizeUrl } from "../../../utils/imageOptimize";
interface ChatHeaderProps {
  chatUserDetails: IParticipant | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ chatUserDetails }) => {
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


  const [openSlider, setSlider] = useState<boolean>(false)

  const {clearchat} = useClearChat(loggedInUser?._id!,chatUserDetails?.roomId!)

  const handleClearChat = ()=>{
    clearchat();
    setSlider(false)
  }

  const {messages} =useAppSelector((state)=>state.messages)

  return (
    <header className="w-[99%] bg-transparent backdrop-blur-2xl shadow-sm rounded-xl border theme-border p-1 flex items-center justify-between px-3">
      <div className="flex items-center gap-2">
        {/* Profile Section */}
        <div className="relative rounded-full p-[2px] flex items-center justify-center">
          {imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded-full" />
          )}

          <img
            src={optimizeUrl(user?.profilePic||'',300)||"/profile-dummy.png"}
            onLoad={()=>{
              if(user?.profilePic == "" || null){
                setImageLoaded(true)
              }
              setImageLoaded(false)
            }
          }
            alt="User avatar"
            loading="lazy"
            className={`rounded-full lg:w-13 lg:h-13 border theme-border md:w-10 md:h-10 w-8 h-8 object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-0" : "opacity-100"
              }`}
          />
        </div>

        {/* Name + Status */}
        <div className="flex flex-col justify-center">
          {!user ? (
            <>
              <div className="h-4 w-32 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded mb-1" />
              <div className="h-3 w-16 bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-700 animate-pulse rounded" />
            </>
          ) : (
            <>
              <h2 className="text-[15px] font-semibold">{user.fullName}</h2>

              {typingUsers.length > 0 ? (
                <TypingIndicator />
              ) : user.isOnline ? (
                <p className="text-[13px] text-disable flex items-center">
                  <span className="ml-1">
                    online
                  </span>
                </p>
              ) : (
                <p className="text-[13px] text-disable">{`Active ${lastActiveText}`}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-1 hover:bg-zinc-500 cursor-pointer transition-all duration-200">
          <CiPhone size={30} />
        </div>
        <div className="rounded-xl p-1 hover:bg-zinc-500 cursor-pointer transition-all duration-200">
          <CiVideoOn size={30} />
        </div>
        <div
          onClick={() => setSlider((prev) => !prev)}
          className="rounded-xl p-1 hover:bg-zinc-500 cursor-pointer transition-all duration-200"
        >
          <CiCircleInfo size={30} />
        </div>
        <div
          className={`
    absolute top-10 right-2 w-48 flex flex-col
    theme-bg-secondary theme-border shadow-sm rounded-xl
    backdrop-blur-xl 
    transform transition-all duration-500 ease-in-out
    text-sm overflow-hidden z-50
    ${openSlider
              ? "translate-y-3 opacity-100 pointer-events-auto"
              : "-translate-y-5 opacity-0 pointer-events-none"}
  `}
        >
          <button className="flex items-center gap-2 p-3 text-left w-full hover:bg-[#7b2ff714] hover:text-[var(--accent-primary)] transition-all">
            <PiImages size={18} />
            <span className="text-[13px] font-medium">View Shared Media</span>
          </button>

          <button className="flex items-center gap-2 p-3 w-full hover:bg-[#7b2ff714] hover:text-[var(--accent-primary)] transition-all">
            <CiSearch size={18} />
            <span className="text-[13px] font-medium">Search in Chat</span>
          </button>
          {messages.length >0 &&

            <button onClick={handleClearChat} className="flex items-center gap-2 p-3 w-full hover:bg-[#7b2ff714] hover:text-[var(--accent-primary)] transition-all">
            <LuTrash size={18} />
            <span className="text-[13px] font-medium">Clear Chat</span>
          </button>
          }

          <button className="flex items-center gap-2 p-3 w-full hover:bg-[#f107a330] hover:text-[var(--error)] transition-all">
            <LuTrash2 size={18} />
            <span className="text-[13px] font-medium">Delete for Both</span>
          </button>

          <button className="flex items-center gap-2 p-3 w-full hover:bg-[#7b2ff714] hover:text-[var(--accent-primary)] transition-all">
            <LuDownload size={18} />
            <span className="text-[13px] font-medium">Export Chat</span>
          </button>
        </div>

      </div>


    </header>
  );
};

export default ChatHeader;
