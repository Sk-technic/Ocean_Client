import { useRef } from "react";
import { getSocket } from "../../api/config/socketClient";

export const useTyping = (roomId: string, user: { id: string; name: string }) => {
  const socket = getSocket(); 
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleTyping = () => {
  if (!debounceRef.current) {
    socket?.emit("typing:start", { roomId, user });
    debounceRef.current = setTimeout(() => (debounceRef.current = null), 200);
  }

  if (typingTimeout.current) clearTimeout(typingTimeout.current);
  typingTimeout.current = setTimeout(() => {
    socket?.emit("typing:stop", { roomId, userId: user.id });
  }, 500);
};

return { handleTyping };
};

export const useUnsendMessage = (roomId: string, messageId: string,userId:string) => {
  const socket = getSocket();
  const unsendMessage = () => {    
    socket?.emit("unsend:message", { roomId, messageId,userId });
  }

  return { unsendMessage };
}

export const useEditMessage = (messageId: string, roomId: string, newContent:string,userId:string) => {
  const socket = getSocket();
  const editMessage = () => { 
    socket?.emit("message:edit", { messageId, roomId,newContent,userId });
  }
  return { editMessage }; 
}

export const useClearChat = (byUser:string,roomId:string) =>{  
  const socket = getSocket();
  const clearchat  = ()=>{
    socket?.emit("clear:chat",{byUser,roomId})
  }
  return {clearchat};
}

export const useSeenMessage = (seenBy:string,messageId:string,roomId:string)=>{
  const socket = getSocket();
  
  const seenMessage = ()=>{
    socket?.emit("message:seen",{seenBy,messageId,roomId})
  }
  return {seenMessage}
}