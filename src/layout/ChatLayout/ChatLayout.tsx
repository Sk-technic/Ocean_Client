import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getSocket } from "../../api/config/socketClient";
import { Link, useNavigate, useParams } from "react-router-dom";
import ChatSidebar from "./Components/ChatSidebar";
import ChatHeader, { type StartCallPayload } from "./Components/ChatHeader";
import MessageList from "./Components/MessageList";
import MessageInput from "./Components/MessageInput";
// import type { IParticipant } from "../../types/chat";
import { RiSendPlaneLine } from "react-icons/ri";
import './chat.css'
// import { useDispatch } from "react-redux";
// import { setMessages, updateOldMessages } from "../../store/slices/messages/messages";
// import { closeReplyMessage } from "../../store/slices/messages/replyMessage";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import { optimizeUrl } from "../../utils/imageOptimize";
// import PrimaryButton from "../../components/Buttons/PrimaryButoon";
// import ToggleSwitch from "../../components/Buttons/ToggleSwitch";
// import toast from "react-hot-toast";
// import { useBlockUser } from "../../hooks/user/userHook";
// import { useClearChat } from "../../hooks/chat/chatEvents";
// import { XCircleIcon } from "lucide-react";
import CreateGroupSlider from "./Components/CreateGroup";
// import { updateBlockedUser } from "../../store/slices/chatList";
import ChatMenu from "./Components/ChatMenu";
// import CallStreamWindow from "./Components/call/CallStreamWindow";
import IncomingCallModal from "./Components/call/IncomingCall";
// import { consumeMedia, consumeSingleProducer, joinSFURoom, leaveSFURoom, produceMedia, sfuState } from "../../services/sfu";
// import { createRecvTransport } from "../../services/sfu/sfuDevice";
import OutgoingCallModal from "./Components/call/OutGoing";
import { useCallSignaling } from "../../hooks/call/useCallSignaling";
import { clearActiveCall, setActiveCall } from "../../store/slices/activeCallSlice";
import CallStreamWindow from "./Components/call/CallStreamWindow";

interface ActiveCall {
  roomId: string;
  roomType: "dm" | "group";
  callType: "audio" | "video";

  remoteUser?: {
    id?: string | undefined;
    name: string;
    avatar?: string | undefined;
  };
}

export interface ICallingUser {
  id?: string | undefined,
  name: string,
  avatar?: string | undefined,
}
const ChatLayout = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [RoomCreater, setRoomCreater] = useState<string>("");
  const [blockedMe, setblockedMe] = useState<boolean>(false);
  const [openslide, setOpenslide] = useState<boolean>(false)
  const { user: dmUser } = useAppSelector((state) => state.user)
  const { activeRoom } = useAppSelector((state) => state.chat)
  const [groupSlider, setGroupSlider] = useState<boolean>(false)
  const filtering = activeRoom?.participants
  const participant = filtering?.find((u) => u?._id !== loggedInUser?._id)

  const [outGoingCall, setOutGoingCall] = useState<StartCallPayload | null>(null);
const[fullScreen,setFullScreen] = useState<boolean>(false);
const [callWindow ,setCallWindow] = useState<boolean>(false)
  const dispatch = useAppDispatch()

  const handleStartCall = (payload: StartCallPayload) => {
    setOutGoingCall(payload);   // outgoing modal open
    // setRemoteUser({
    //   roomId: payload.roomId,
    //   roomType: payload.roomType,
    //   callType: payload.callType,
    //   remoteUser: payload.receiver,
    // });
  };

  const socket = getSocket();

  useCallSignaling({
    // onIncomingCall(payload) {
    //   console.log("📞 Incoming DM call:", payload);

    //   if (outGoingCall) return;

    //   setIncomingCall({
    //     ...payload,
    //     type: "dm",
    //   });

    // },
    // onCallCancelled() {
    //   setIncomingCall(null);

    // },
    onCallRejected() {
      setOutGoingCall(null)
      // setIncomingCall(null)
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
        setOutGoingCall(null)
      }
    },
  
  })

//  useEffect(() => {
//     if (!socket) return
//     const handleCallEnded = (payload:any) => {
//       console.log("payload ==== call ended", payload);
//       dispatch(clearActiveCall())
//       setCallWindow(false)
//     }
//     socket?.on("call:ended", handleCallEnded)

//     return () => {
//       socket?.off("call:ended", handleCallEnded)

//     }
//   }, [socket])

  return (
    <main className="w-full flex h-full">
     {!fullScreen && <ChatSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        navigate={navigate}
        onSetRoomCreater={setRoomCreater}
        onSetBlockedMe={setblockedMe}
        onSetGroupSlider={setGroupSlider}
      />}


      {/* {incomingCall && (
        <IncomingCallModal
          data={incomingCall}
          onClose={() => setIncomingCall(null)}
        />
      )} */}

      {outGoingCall && (
        <OutgoingCallModal
          data={outGoingCall}
          onCancel={() => setOutGoingCall(null)}
        />
      )}
      {/* CHAT AREA */}
      {(activeRoom || dmUser) ? (
        <section className={`relative w-full relative flex-1 flex flex-col justify-end h-full overflow-hidden`}>
          {participant?.isBlocked && <div className="absolute w-full h-full bg-black/50 z-50"></div>}

          <div className="absolute inset-0 pointer-events-none">
            <img
              src="/chatbg/bg1.jpg"
              alt="chat background"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0 bg-white/30 dark:bg-black/50 backdrop-blur-[0px]"
            />
          </div>

          <section className={`w-full z-100 rounded-xl p-2`}>
            <ChatHeader
              onSetSlide={setOpenslide}
              onStartCall={handleStartCall}
            />
          </section>

          <div className={`flex-1 min-h-0 relative flex flex-col overflow-hidden p-2`}>
            <MessageList />
          </div>

          <MessageInput
            RoomCreater={RoomCreater}
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
      <CreateGroupSlider groupSlider={groupSlider} setGroupSlider={setGroupSlider} />
      {
        <section className={`relative ${openslide ? 'w-90' : 'w-0 opacity-0'} duration-300 h-full transition-all easy-in-out`}>
          <ChatMenu />
        </section>
      }

    </main>
  );
};

export default ChatLayout;
