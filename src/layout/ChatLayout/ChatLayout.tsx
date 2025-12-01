import { useEffect, useState } from "react";
import {
  useGetRoom,
  useMessages,
  useSendMedia,
} from "../../hooks/chat/chatHook";
import { useAppSelector } from "../../store/hooks";
import { getSocket } from "../../api/config/socketClient";
import { useNavigate, useParams } from "react-router-dom";
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
const ChatLayout = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const socket = getSocket();
  const navigate = useNavigate();
  const { roomId: newRoomUser } = useParams();

  const [chatUserDetails, setChatUser] = useState<IParticipant | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string>("");
  const [receiverId, setReceiverId] = useState<string>("");
  const [sendMessage, setSendMessage] = useState<string>("");
  const [receiver, setReceiver] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [RoomCreater, setRoomCreater] = useState<string>("");

  const { data: roomData, isSuccess: isRoomFetched } =
    useGetRoom(newRoomUser!, loggedInUser?._id!);
    const { messageId: replymessageId} = useAppSelector((state) => state.replyMessage);
  
  useEffect(() => {
    if (isRoomFetched && roomData && newRoomUser) {
      const user = roomData;
      const target = user.data.participants.find((p: any) => p._id !== loggedInUser?._id);
      if (!target) return;

      const chatInfo = {
        username: target.username,
        fullName: target.fullName,
        profilePic: target.profilePic,
        _id: target._id,
        isOnline:target.isOnline,
        lastActive:target.lastActive,
        roomId:newRoomUser,
        unreadCount:target.unreadCount
      };

      setChatUser(chatInfo);
      setSelectedRoomId(newRoomUser);
      setReceiverId(target._id);
      setReceiver(target._id);
    }
  }, [isRoomFetched, roomData]);

  useEffect(() => {
    if (!socket || !selectedRoomId) return;
    socket.emit("chat:join", selectedRoomId);
    // console.log("user join room:", selectedRoomId);
  }, [socket, selectedRoomId]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(selectedRoomId);

  useEffect(() => {
    if (!data?.pages) return;

    const allMessages = data.pages
      .flatMap((page) => page.messages)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    // setMessagesList(allMessages);
    dispatch(setMessages({messages:allMessages}))
  }, [data]);

  const loadOlderMessages = async () => {
    const result = await fetchNextPage();
    if (!result.data) return;

    const lastPage = result.data.pages[result.data.pages.length - 1];
    if (!lastPage?.messages) return;

    dispatch(updateOldMessages({oldMessages:lastPage.messages}))
  };

  const { mutate: sendMedia } = useSendMedia();
  const handleSendMedia = () => {
    sendMedia({
      senderId: loggedInUser?._id!,
      receiverId: receiver || receiverId,
      content: sendMessage,
      messageType: "media",
      roomId: selectedRoomId,
      media: selectedFiles,
      replyTo: replymessageId ?? null
    });
    setSelectedFiles([]);
    setSendMessage("");
    dispatch(closeReplyMessage())
  };

  const dispatch = useDispatch();
 

  return (
    <main className="w-full flex items-start h-full ">
      <ChatSidebar
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        onSelectUser={setChatUser}
        navigate={navigate}
        onSelectReceiver={setReceiverId}
        onSetRoomCreater={setRoomCreater}
      />


      {/* CHAT AREA */}
      {selectedRoomId ? (
        <section className="relative w-full relative flex-1 flex flex-col justify-end h-full  p-2 overflow-hidden ">
          <section className={`w-full z-100 rounded-xl`}>
          <ChatHeader chatUserDetails={chatUserDetails} />
          </section>

          <MessageList
            loadOlderMessages={loadOlderMessages}
            hasMore={hasNextPage}
            isLoading={isFetchingNextPage}
            forceScrollBottom={sendMessage.trim().length === 0}
            roomId={selectedRoomId}

          />

          <MessageInput
          RoomCreater={RoomCreater}
            sendMessage={sendMessage}
            setSendMessage={setSendMessage}
            onSend={() =>
              selectedFiles.length > 0 ? handleSendMedia() : null
            }
            receiver={receiverId}
            selectedFiles={selectedFiles}
            setSelectedFiles={setSelectedFiles}
            selectedRoomId={selectedRoomId}
            loggedInUser={loggedInUser}
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
    </main>
  );
};

export default ChatLayout;
