import React, { useCallback, useMemo, useRef, useState, useLayoutEffect, useEffect } from "react";
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
import TypingIndicator from "../../../utils/TypingWave";
import { queryClient } from "../../../api/config/queryClient";

const MessageList: React.FC = () => {
  const socket = getSocket();
  const { user: loggedInUser } = useAppSelector((s) => s.auth);
  const { activeRoom } = useAppSelector((s) => s.chat);
  const { user: dmUser } = useAppSelector((s) => s.user);

  const effectiveRoomId = activeRoom?._id ?? (dmUser?._id ? `temp-room-${dmUser._id}` : null);
  


    const { messages, isLoading } = useChatMessages(effectiveRoomId!);
  // Typing Indicator State (Sabse upar le aaye)
  const [typingUsers, setTypingUsers] = useState<{ id: string; name: string }[]>([]);

  useMessageDelivery(socket);
  useIncomingMessages(socket, loggedInUser?._id!);
  useIncomingMessageDelete(socket)
  useMessageEditListener(socket,queryClient)
  /* Typing Indicator Hook (Sabse upar le aaye) */
  useEffect(() => {
    if (!socket || !activeRoom?._id) return;

    const handler = ({ roomId, typingUsers }: any) => {
      if (roomId === activeRoom._id) {
        setTypingUsers(
          typingUsers.filter((u: { id: string }) => u.id !== loggedInUser?._id)
        );
      }
    };

    socket.on("typing:update", handler);
    return () => { socket.off("typing:update", handler) };
  }, [socket, activeRoom?._id, loggedInUser?._id]);

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

  // 🔑 CONDITION AB YAHAN AAYEGI (Sare hooks ke niche)
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
     { typingUsers.length > 0 &&
      <div className="border-3 ml-5 w-fit theme-bg-primary theme-border rounded-r-xl rounded-tl-xl">
        <TypingIndicator/>
      </div>
     }

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

// import {
//   addMessage,
//   clearRoomMessages,
//   setMessages,
//   updateMessage,
//   updateSeen,
// } from "../../../store/slices/messages/messages";
// import {
//   clearLastMessage,
//   setActiveRoom,
//   updateLastMessage,
// } from "../../../store/slices/chatList";
// import Loader from "../../../components/Loader/Loader";
// initialTopMostItemIndex={messages.length}
// followOutput={false}
// increaseViewportBy={0}
// startReached={loadMore}
// overscan={0}
// atBottomStateChange={(bottom) => setIsAtBottom(bottom)}
// computeItemKey={(index, item) => item._id}
// rangeChanged={(range) => {
//   for (let i = range?.startIndex; i <= range?.endIndex; i++) {
//     const msg = messages[i];
//     if (!msg) continue;
//     if (msg.status != "seen") {
//       const seenUser = msg?.seenBy?.find((u: any) =>  u?.user?._id?.toString() === loggedInUser?._id?.toString());
//       console.log(seenUser);

//       if (!seenUser) {
//         console.log("user not found");

//         socket?.emit("message:seen", {
//           userId: loggedInUser?._id,
//           roomId: msg.roomId,
//           messageId: msg?._id
//         });
//       }
//     }

//   }
// }}

// loadOlderMessages,
// hasMore,
// isLoading,
// roomId

/* ------------------------------------------------------
      LOAD OLDER MESSAGES ON SCROLL TOP
  ------------------------------------------------------ */
// const loadMore = async () => {
//   if (!hasMore) return;
//   await loadOlderMessages();
// };

/* ------------------------------------------------------
      SOCKET EVENTS (unsend / edit / clear)
  ------------------------------------------------------ */

// useEffect(() => {
//   if (!socket) return;

//   const handleUnsend = (payload: Record<string, Message>) => {
//     dispatch(updateMessage(payload.message));
//   };

//   const handleEdit = (payload: Record<string, Message>) => {
//     dispatch(updateMessage(payload.message));
//   };

//   const handleClearSuccess = ({
//     roomId,
//     byUser,
//   }: {
//     roomId: string;
//     byUser: string;
//   }) => {
//     if (byUser !== loggedInUser?._id) return;

//     dispatch(clearRoomMessages());
//     dispatch(clearLastMessage({ roomId }));
//   };

//   socket.on("message:unsent", handleUnsend);
//   socket.on("message:edit:success", handleEdit);
//   socket.on("clear:chat:success", handleClearSuccess);
//   return () => {
//     socket.off("message:unsent", handleUnsend);
//     socket.off("message:edit:success", handleEdit);
//     socket.off("clear:chat:success", handleClearSuccess);

//   };
// }, [socket, loggedInUser]);

//new message
// useEffect(() => {
//   if (!socket) return;
//   // const handleReadMessages = (data: { userId: string, roomId: string }) => {
//   //   const socket = getSocket()
//   //   socket?.emit("room:read", data)
//   // }
//   const handleNewMessage = (newMessage: any) => {
//     if (activeRoom) {
//       if (newMessage.roomId === activeRoom?._id) {
//         dispatch(addMessage(newMessage));
//         // handleReadMessages({ userId: loggedInUser?._id!, roomId: newMessage?.room?._id })
//       }
//     }
//   };
//   socket?.on("chat:new_message", handleNewMessage);
//   return () => {
//     socket?.off("chat:new_message", handleNewMessage);
//   };
// }, [socket, activeRoom?._id]);

//new dm
// useEffect(() => {
//   const handleAddMessage = (data: any) => {
//     if (dmUser) {
//       const room = list.find((u) => u.participants.some((p) => p?._id === dmUser?._id))
//       if (!room) {
//         dispatch(addMessage(data?.message))
//       }
//     }
//   }
//   socket?.on("room:update", handleAddMessage)
//   return () => {
//     socket?.off("room:update", handleAddMessage);
//   };
// }, [dmUser])

// useEffect(() => {
//   if (!isAtBottom) return;
//   requestAnimationFrame(() => {
//     virtuosoRef.current?.scrollToIndex({
//       index: messages.length - 1,
//       behavior: "auto"
//     });
//   });
// }, [messages.length]);

// useEffect(()=>{
//   if(!socket)return;
//    const handleseenMessages = (message: any) => {
//     dispatch(updateSeen(message))
//     }
//       socket?.on("message:seen:success", handleseenMessages);
// return ()=>{
//         socket?.off("message:seen:success", handleseenMessages);

// }
// },[socket])
