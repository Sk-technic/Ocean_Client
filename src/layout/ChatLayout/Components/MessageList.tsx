import React, { useEffect, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import MessageBubble from "./MesssageBubble";
import type { Message } from "../../../types/chat";
import { getSocket } from "../../../api/config/socketClient";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  addMessage,
  clearRoomMessages,
  updateMessage,
  updateSeen,
} from "../../../store/slices/messages/messages";
import {
  clearLastMessage,
  updateLastMessage,
} from "../../../store/slices/chatList";
import Loader from "../../../components/Loader/Loader";

interface MessageListProps {
  loadOlderMessages: () => Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  forceScrollBottom?: boolean;
  roomId: string;
}

const MessageList: React.FC<MessageListProps> = ({
  loadOlderMessages,
  hasMore,
  isLoading,
  roomId
}) => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth)
  const { messages } = useAppSelector((state) => state.messages);
  const dispatch = useAppDispatch();

  const virtuosoRef = React.useRef<VirtuosoHandle>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);



  /* ------------------------------------------------------
      LOAD OLDER MESSAGES ON SCROLL TOP
  ------------------------------------------------------ */
  const loadMore = async () => {
    if (!hasMore) return;
    await loadOlderMessages();
  };

  /* ------------------------------------------------------
      SOCKET EVENTS (unsend / edit / clear)
  ------------------------------------------------------ */
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    const handleUnsend = (payload: Record<string, Message>) => {
      dispatch(updateMessage(payload.message));
    };

    const handleEdit = (payload: Record<string, Message>) => {
      dispatch(updateMessage(payload.message));
    };

    const handleClearSuccess = ({
      roomId,
      byUser,
    }: {
      roomId: string;
      byUser: string;
    }) => {
      if (byUser !== loggedInUser?._id) return;

      dispatch(clearRoomMessages({ roomId }));
      dispatch(clearLastMessage({ roomId }));
    };

    socket.on("message:unsent", handleUnsend);
    socket.on("message:edit:success", handleEdit);
    socket.on("clear:chat:success", handleClearSuccess);
    return () => {
      socket.off("message:unsent", handleUnsend);
      socket.off("message:edit:success", handleEdit);
      socket.off("clear:chat:success", handleClearSuccess);

    };
  }, [socket, loggedInUser]);

  useEffect(() => {
    if (!socket) return;

    const handleReadMessages = (data: { userId: string, roomId: string }) => {
      const socket = getSocket()
      socket?.emit("room:read", data)
    }
    const handleNewMessage = (newMessage: any) => {
      if (newMessage.room?._id === roomId) {
        dispatch(addMessage(newMessage.message));
        dispatch(updateLastMessage({ roomId: newMessage?.roomId, message: newMessage }))
        handleReadMessages({ userId: loggedInUser?._id!, roomId: newMessage?.room?._id })
      }
    };

    socket.on("chat:new_message", handleNewMessage);
    return () => {
      socket.off("chat:new_message", handleNewMessage);
    };
  }, [socket, roomId]);

  useEffect(() => {

    if (!isAtBottom) return;

    requestAnimationFrame(() => {
      virtuosoRef.current?.scrollToIndex({
        index: messages.length - 1,
        behavior: "auto"
      });
    });
  }, [messages.length]);

useEffect(()=>{
  if(!socket)return;
   const handleseenMessages = (message: any) => {
      console.log("message: ", message);
    dispatch(updateSeen(message))
    }
      socket?.on("message:seen:success", handleseenMessages);
return ()=>{
        socket?.off("message:seen:success", handleseenMessages);

}
},[socket])
  return (
    <div style={{ height: "100%" }} className="overflow-hidden">
      {isLoading && (
        <p className="text-center text-xs text-gray-400 py-1">
          <Loader
            size={20}
          />
        </p>
      )}
      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        style={{ height: "100%" }}
        className="custom-scrollbar"
        initialTopMostItemIndex={messages.length}
        followOutput={false}
        increaseViewportBy={0}
        startReached={loadMore}
        overscan={0}
        atBottomStateChange={(bottom) => setIsAtBottom(bottom)}
        computeItemKey={(index, item) => item._id}
        rangeChanged={(range) => {
          for (let i = range?.startIndex; i <= range?.endIndex; i++) {
            const msg = messages[i];
            if (!msg) continue;
            if (msg.status != "seen") {
              const seenUser = msg?.seenBy?.find((u: any) =>  u?.user?._id?.toString() === loggedInUser?._id?.toString());
              console.log(seenUser);

              if (!seenUser) {
                console.log("user not found");
                
                socket?.emit("message:seen", {
                  userId: loggedInUser?._id,
                  roomId: msg.roomId,
                  messageId: msg?._id
                });
              }
            }

          }
        }}
        itemContent={(index, msg) => (
          <MessageBubble
            message={msg}
            prevMessage={messages[index - 1]}
            nextMessage={messages[index + 1]}
            onMediaLoaded={() => virtuosoRef.current?.scrollBy({ top: 0.1 })}
          />
        )}
      />
    </div>
  );
};

export default MessageList;
