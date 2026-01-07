import React, { useCallback, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";

import MessageBubble from "./MesssageBubble";
import { useAppSelector } from "../../../store/hooks";
import { 
  useChatMessages, 
  useIncomingMessageDelete, 
  useIncomingMessages, 
  useMessageDelivery, 
  useMessageEditListener
} from "../../../hooks/chat/chatHook";
import { getSocket } from "../../../api/config/socketClient";
// import TypingIndicator from "../../../utils/TypingWave";
import { queryClient } from "../../../api/config/queryClient";

const MessageList: React.FC = () => {
  const socket = getSocket();
  const { user: loggedInUser } = useAppSelector((s) => s.auth);
  const { activeRoom } = useAppSelector((s) => s.chat);
  const { user: dmUser } = useAppSelector((s) => s.user);

  const effectiveRoomId = activeRoom?._id ?? (dmUser?._id ? `temp-room-${dmUser._id}` : null);
  


    const { messages, isLoading } = useChatMessages(effectiveRoomId!);
  // Typing Indicator State (Sabse upar le aaye)
  // const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);

  useMessageDelivery(socket);
  useIncomingMessages(socket, loggedInUser?._id!);
  useIncomingMessageDelete(socket)
  useMessageEditListener(socket,queryClient)
  /* Typing Indicator Hook (Sabse upar le aaye) */
  // useEffect(() => {
  //   if (!socket || !activeRoom?._id) return;

  //   const handler = ({ roomId, typingUsers }: any) => {
  //     if (roomId === activeRoom._id) {
  //       setTypingUsers(
  //         typingUsers.filter((u: { id: string }) => u.id !== loggedInUser?._id)
  //       );
  //     }
  //   };

  //   socket.on("typing:update", handler);
  //   return () => { socket.off("typing:update", handler) };
  // }, [socket, activeRoom?._id, loggedInUser?._id]);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const prevCountRef = useRef(0);

  const allMessages = useMemo(() => Array.isArray(messages) ? messages : [], [messages]);
  const lastMessage = allMessages[allMessages.length - 1];
  const isMe = lastMessage?.sender?._id === loggedInUser?._id;

  const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "auto") => {
    if (virtuosoRef.current && allMessages.length > 0) {
      virtuosoRef.current.scrollToIndex({
        index: allMessages.length - 1,
        align: "end",
        behavior,
      });
    }
  }, [allMessages.length]);

  useLayoutEffect(() => {
    const currentCount = allMessages.length;
    const isNewMessage = currentCount > prevCountRef.current;
    prevCountRef.current = currentCount;
    if (!isNewMessage) return;
    if (isMe || isAtBottom) {
      const timer = setTimeout(() => scrollToBottom("smooth"), 30);
      return () => clearTimeout(timer);
    }
  }, [allMessages.length, isMe, isAtBottom, scrollToBottom]);

  if (allMessages.length === 0 && isLoading) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Loading messages...</div>;
  }
  if(allMessages.length === 0){
        return <div className="flex-1 flex items-center justify-center text-gray-400">No messages...</div>;

  }

  return (
    <div className="flex-1 w-full h-full relative flex flex-col min-h-0 gap-2 bg-transparent">
      <Virtuoso
        ref={virtuosoRef}
        data={allMessages}
        className="custom-scrollbar"
        style={{ height: "100%", width: "100%" }}
        initialTopMostItemIndex={allMessages.length > 0 ? allMessages.length - 1 : 0}
        computeItemKey={(index, item) => item._id || item.tempId || `msg-${index}`}
        alignToBottom={true}
        followOutput={false}
        atBottomThreshold={100}
        increaseViewportBy={400} 
        atBottomStateChange={setIsAtBottom}
        itemContent={(index, msg) => (
          <div className="py-[1px]"> 
             <MessageBubble 
                message={msg} 
                prevMessage={allMessages[index - 1]} 
                nextMessage={allMessages[index + 1]} 
              />
          </div>
        )}
      />
     
     {/* Typing Indicator UI */}
     {/* { typingUsers &&
     <main className="w-fit ml-5 flex items-end justify-start gap-1 rounded-r-xl rounded-tl-xl overflow-hidden">

      <div className="w-full ">
        <TypingIndicator/>
      </div>

     </main>
     } */}
     {/* {
       <span>{typingNames()}</span>
     } */}

      {/* Manual Scroll Button */}
      {!isAtBottom && !isMe && allMessages.length > 0 && (
        <button 
          onClick={() => scrollToBottom("smooth")}
          className="absolute bottom-6 right-8 bg-blue-600 text-white p-3 rounded-full shadow-2xl z-50 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <span className="text-xs font-bold px-1">New Messages</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path fillRule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;
