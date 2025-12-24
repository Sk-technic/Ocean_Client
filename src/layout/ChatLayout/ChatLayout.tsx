import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSocket } from "../../api/config/socketClient";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatSidebar from "./Components/ChatSidebar";
import ChatHeader from "./Components/ChatHeader";
import MessageList from "./Components/MessageList";
import MessageInput from "./Components/MessageInput";
import type { IParticipant } from "../../types/chat";
import { RiSendPlaneLine } from "react-icons/ri";
import './chat.css'
import { useDispatch } from "react-redux";
import { setMessages, updateOldMessages } from "../../store/slices/messages/messages";
import { closeReplyMessage } from "../../store/slices/messages/replyMessage";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { optimizeUrl } from "../../utils/imageOptimize";
import PrimaryButton from "../../components/Buttons/PrimaryButoon";
import ToggleSwitch from "../../components/Buttons/ToggleSwitch";
import toast from "react-hot-toast";
import { useBlockUser } from "../../hooks/user/userHook";
import { useClearChat } from "../../hooks/chat/chatEvents";
import { XCircleIcon } from "lucide-react";
import CreateGroupSlider from "./Components/CreateGroup";
import { updateBlockedUser } from "../../store/slices/chatList";
const ChatLayout = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  // const [sendMessage, setSendMessage] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [RoomCreater, setRoomCreater] = useState<string>("");
  const [blockedMe, setblockedMe] = useState<boolean>(false);
  const [openslide, setOpenslide] = useState<boolean>(false)
  const { user: dmUser } = useAppSelector((state) => state.user)
  const { activeRoom } = useAppSelector((state) => state.chat)


  const dispatch = useAppDispatch();

  const { mutateAsync: blockUser } = useBlockUser()
  const handleBlockUser = () => {
    toast.promise(
      blockUser(activeRoom?.participants.find(p => p._id !== loggedInUser?._id)?._id!, {
        onSuccess: () => {
          dispatch(updateBlockedUser({ roomId: activeRoom?._id!, loggedInUser: loggedInUser?._id! }))
        }
      }),
      {
        loading: 'Blocking user...',
        success: 'User blocked successfully!',
        error: 'Failed to block user.',
      }
    );
  }

  const { clearchat } = useClearChat(loggedInUser?._id!, activeRoom?._id!);
  const handleClearChat = () => {
    clearchat()
    toast.success("Chat cleared successfully!");
  }

  const [groupSlider, setGroupSlider] = useState<boolean>(false)
  const isUserBlocked = activeRoom?.participants.find((p) => p?._id !== loggedInUser?._id)

  // console.log("room",activeRoom);

  // console.log("user",isUserBlocked);

  return (
    <main className="w-full flex h-full">
      <ChatSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        // onSelectUser={setChatUser}
        navigate={navigate}
        // onSelectReceiver={setReceiverId}
        onSetRoomCreater={setRoomCreater}


        onSetBlockedMe={setblockedMe}
        onSetGroupSlider={setGroupSlider}

      />


      {/* CHAT AREA */}
      {(activeRoom || dmUser) ? (
        <section className={`relative w-full p-3 relative flex-1 flex flex-col justify-end h-full overflow-hidden `}>
          <div className="absolute inset-0 pointer-events-none">
            {/* Background image */}
            <img
              src="/chatbg/bg3.jpg"
              alt="chat background"
              className="w-full h-full object-cover"
            />

            {/* Theme overlay */}
            <div
              className="absolute inset-0 bg-white/30 dark:bg-black/50 backdrop-blur-[0px]"
            />
          </div>

          <section className={`w-full z-100 rounded-xl`}>
            <ChatHeader
              onSetSlide={setOpenslide}
            />
          </section>

      <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden">
       <MessageList />
    </div>
          <MessageInput
            RoomCreater={RoomCreater}
            // sendMessage={sendMessage}
            // setSendMessage={setSendMessage}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            loggedInUser={loggedInUser}
            user={dmUser}
          />
        </section>
      ) : (
        <section className="flex-1 flex items-center justify-center border rounded-xl h-full theme-border">
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="border flex items-center justify-center p-5 rounded-full border-2 border-[var(--accent-primary)]">
              <RiSendPlaneLine size={30} className="theme-text-muted" />
            </div>
            <p className="theme-text-primary text-md">Your Messages</p>
            <p className="theme-text-muted text-xs">
              Select a chat to start messaging
            </p>
            <button className="active-theme-button p-2 text-sm rounded-xl">
              Send message
            </button>
          </div>
        </section>
      )}


      {<section className={`bg-transparent flex flex-col items-end justify-start backdrop-blur-3xl border-l-2 border-t-2 border-b-2 shadow-sm rounded-l-xl theme-border top-20 absolute right-0 w-90 h-[80%] ${openslide ? 'translate-x-0' : 'translate-x-100'} duration-1000`}>
        <div className="w-full border-b-2 theme-border">
          <h1 className="theme-text-primary text-2xl font-semibold p-3">Details</h1>
        </div>
        {!activeRoom?.blockedMe && <div className={`w-full border-b-2 theme-border pl-3 py-2 space-y-2 capitalize`}>
          {activeRoom?.type == "group" && <section className="flex items-center justify-between">
            <span className="text-sm">change Group Name</span>
            <PrimaryButton fullWidth={false} label="change" width="fit px-3 py-1 rounded-lg scale-75" />
          </section>}
          <section className="flex items-center justify-between gap-3">
            <span className="text-sm">Mute Messages</span>
            <ToggleSwitch value={true} onClick={() => toast.success("messages mute")} className="scale-75" />
          </section>
        </div>}

        <div className="w-full">
          {
            activeRoom?.participants.map((p, index) => (
              <div key={index} className="flex items-center gap-3 px-3 py-2 overflow-y-scroll custom-scrollbar max-h-30 theme-hover-effect duration-300">
                <LazyLoadImage
                  src={optimizeUrl(p.profilePic || '', 50) || '/profile.png'}
                  alt={p.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col items-start justify-center ">
                  <span className={`theme-text-primary text-xs font-semibold ${loggedInUser?._id == p._id && 'text-disable'}`}>{loggedInUser?.fullName == p.fullName ? 'You' : p.fullName}</span>
                  <span className="theme-text-muted text-[10px] font-normal">{p.username}</span>
                </div>
              </div>
            ))
          }
        </div>
        <div className="absolute bottom-0 w-full border-t-2 theme-border">
          {<section className="px-3 py-2  flex flex-col gap-3">
            <div className="flex items-center justify-start">
              <PrimaryButton label={activeRoom?.type == "group" ? "Leave Chat" : "Report"} fullWidth={false} width="fit px-2 py-1 rounded-md" />
            </div>

            {(activeRoom?.type == "dm") ? <div className="flex items-center justify-start">
              {!isUserBlocked?.isBlocked ?
                <PrimaryButton label={`block`} onClick={() => handleBlockUser()} fullWidth={false} width="fit px-2 py-1 rounded-md" />
                :
                <div className="text-sm theme-text-muted">
                  <span className="font-medium">User blocked</span>
                  <p>
                    You have blocked this user. To resume the conversation, please visit
                    <Link to={'/settings/privacy_settings/blocked'} className="font-semibold theme-text-primary"> Settings </Link>
                    and remove them from your blocked users list.
                  </p>
                </div>
              }
            </div>
              :
              <p className="text-xs theme-text-muted">
                You won't be able to send or receive messages unless someone adds you back to the chat. No one will be notified that you left the chat.
              </p>
            }

            <div className="flex items-center justify-start">
              <PrimaryButton label="Delete Chat" fullWidth={false} width="fit px-2 py-1 rounded-md" onClick={() => handleClearChat()} />
            </div>
          </section>}
        </div>

      </section>}
      <CreateGroupSlider groupSlider={groupSlider} setGroupSlider={setGroupSlider} />
    </main>
  );
};

export default ChatLayout;
