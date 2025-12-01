import React, { useState, useEffect, useMemo } from "react";
import type { ChatRoom, IParticipant, IUserRoom, Message } from "../../../types/chat";
import SearchInput from "../../../components/searchHeader/SearchComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { HiOutlineAtSymbol } from "react-icons/hi2";
import { getSocket } from "../../../api/config/socketClient";
import { updateCount, updateLastMessage } from "../../../store/slices/chatList";
import { optimizeUrl } from "../../../utils/imageOptimize";

const ChatSidebar: React.FC<{
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectUser: (user: IParticipant) => void;
  onSelectReceiver: (receiver: string) => void;
  navigate: (path: string) => void;
    onSetRoomCreater:(value:string)=>void;

}> = ({ selectedRoomId, onSelectRoom, onSelectUser, onSelectReceiver, navigate,onSetRoomCreater}) => {
  const Users = useAppSelector((state) => state.chat.list);

  const loading = useAppSelector((state) => state.chat.loading);
  const { user: loggedInUser } = useAppSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredUsers = useMemo(() => {
    if (!Users) return [];
    if (!debouncedSearch) return Users;

    const matched = Users.filter((u) => {
      const p = u.participants.find((p) => p._id !== loggedInUser?._id);
      if (!p) return false;
      return (
        p.fullName?.toLowerCase().includes(debouncedSearch) ||
        p.username?.toLowerCase().includes(debouncedSearch)
      );
    });


    const unmatched = Users.filter((u) => !matched.includes(u));
    return [...matched, ...unmatched];
  }, [Users, debouncedSearch, loggedInUser?._id]);
  // console.log("filteredUsers: ",filteredUsers)
  const optimizeUrl = (url: string) => url.replace("/upload/", "/upload/w_300,q_auto,f_auto/");
  const socket = getSocket()
  const dispatch = useAppDispatch();

  const handleReadMessages = (data:{userId:string,roomId:string})=>{
     const socket =  getSocket()
     socket?.emit("room:read",data)
  }

  useEffect(()=>{
    if(!socket) return;
    const handleResetCount = (updatedCounts:ChatRoom)=>{
      // console.log("updC",updatedCounts);


      const myState = updatedCounts?.participants?.find(
        (p: any) => p.user === loggedInUser?._id
      );      
        dispatch(updateCount({roomId:updatedCounts?._id,userId:loggedInUser?._id!,count:myState?.unreadCount ?? 0}))
    }

    const handleUpdateRoom = (message:Message)=>{
      dispatch(updateLastMessage({roomId:message?.roomId,message:message}))
    }
    socket?.on("room:unread:reset",handleResetCount)
    socket?.on("unsend:update:room",handleUpdateRoom)

    return ()=>{
      socket?.off("room:unread:reset",handleResetCount)
      socket?.off("unsend:update:room",handleUpdateRoom)
    }
  },[socket])

  return (
    <aside className="w-[25vw] h-full  flex flex-col p-2 overflow-hidden">
      <section className="flex flex-col justify-between h-full gap-1">

        <div className="flex flex-col h-full  border theme-border rounded-xl p-2 gap-1">
          <div className="flex w-full rounded-xl h-fit items-end  justify-start p-3 gap-2">
            <div className="w-fit h-fit  flex items-center justify-center bg-transparent theme-border border rounded-full">
              <LazyLoadImage
            loading="lazy"
            src={optimizeUrl(loggedInUser?.profilePic || '') || "./profile-dummy.png"}
            alt={loggedInUser?.fullName}
            className={`w-13 h-13 rounded-full overflow-hodden object-cover transition-opacity duration-150`}
            />
            </div>
            <div className="flex flex-col">
              <p className="flex items-center justify-start">
                <HiOutlineAtSymbol size={20} strokeWidth={2} />
                <span className="text-xl font-semibold">{loggedInUser?.username}</span>
              </p>
              <span className="text-sm text-disable">{loggedInUser?.fullName}</span>
            </div>
          </div>

          <SearchInput
            name="search"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="p-3 flex flex-col gap-3 overflow-y-auto h-full custom-scrollbar">
            {loading ? (
              <SidebarSkeletonLoader />
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const participant = u.participants.find((p) => p._id !== loggedInUser?._id);
                const count = u.participants.find((p)=>p?._id == loggedInUser?._id)
                
                const CountParam ={
                  userId:loggedInUser?._id!,
                  roomId:u._id
                }
                if (!participant) return null;
                return (
                  <SidebarUserCard
                    key={`${u._id}-${participant._id}-${participant.isOnline}`}
                    user={u}
                    participant={{ ...participant, roomId: u._id ,unreadCount:count?.unreadCount ?? 0}}
                    selected={selectedRoomId === u._id}
                    onClick={() => {
                      navigate("/message");
                      onSelectRoom(u._id);
                      onSelectUser({ ...participant, roomId: u._id });
                      onSelectReceiver(participant._id);
                      handleReadMessages(CountParam)
                      onSetRoomCreater(u?.createdBy?.toString()!)
                    }}

                  />
                );
              })
            ) : (
              <NoResults search={search} />
            )}
          </div>
        </div>

      </section>
    </aside>
  );
};

export default ChatSidebar;

const SidebarUserCard = ({
  user,
  participant,
  selected,
  onClick,
}: {
  user: IUserRoom;
  participant: IParticipant;
  selected: boolean;
  onClick: () => void;
}) => {
  const [loaded, setLoaded] = useState(false);
  const { user: loggedInUser } = useAppSelector((state) => state.auth)

  const preview = user.lastMessageMeta?.text || "No messages";

  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between pr-5 gap-3 p-1 rounded-xl theme-text-primary cursor-pointer select-none 
        transition-colors duration-150 ease-in-out
        ${selected ? "bg-[var(--text-disabled)] text-primary" : "hover:bg-zinc-500/40"}
      `}
    >
      <section className="flex items-center justify-start gap-3">

        <div className="relative w-13 h-13 rounded-full flex-shrink-0">
          {(!loaded) && <div className="absolute inset-0 overflow-hidden bg-gray-700 animate-pulse" />}
          <img
            loading="lazy"
            src={optimizeUrl(participant?.profilePic||'',300)||"/profile-dummy.png"}
            alt={participant.fullName}
            onLoad={() => {
              if(participant?.profilePic ==''||null){
                setLoaded(false)
              }
              setLoaded(true)
            }}
            className={`w-13 h-13 rounded-full overflow-hodden object-cover ${loaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-150`}
          />
          <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${participant.isOnline ? 'border-zinc-100 border-2' : ''}
          ${participant.isOnline ? "bg-lime-500 scale-100 shadow-sm" : ''} 
          transition-all duration-300 ease-out`}
            title={participant.isOnline ? "Online" : "Offline"}
          />
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className={`text-[14px] truncate font-medium`}>{participant.fullName}</h1>
          <span className={` flex items-center justify-start gap-1`}>
            {
              (user.lastMessageMeta?.sender?.toString() == loggedInUser?._id.toString()) ?
                <span className="text-xs text-zinc-100 ">you</span>
                : ''
            }
            <span className="text-zinc-100 truncate flex text-[12px]">
              {preview.length > 23 ? preview.slice(0, 25) + "..." : preview}
            </span>

          </span>
        </div>
      </section>

      {(participant?.unreadCount != 0) && (
        <div className="w-5 h-5 bg-[var(--text-muted)] p-1 rounded-full flex items-center justify-center text-xs">
          <span className="text-zinc-800">{participant?.unreadCount ?? 0}</span>
        </div>
      )}
    </div>
  );
};

const SidebarSkeletonLoader = () => (
  <div className="flex flex-col gap-3 p-2">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 ">
        <div className="w-11 h-11 bg-gray-700 animate-pulse rounded-full" />
        <div className="flex-1">
          <div className="w-2/3 h-3 bg-gray-700 rounded-md animate-pulse mb-2" />
          <div className="w-1/2 h-2 bg-gray-800 rounded-md animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const NoResults = ({ search }: { search: string }) => (
  <div className="flex flex-col items-center justify-center text-center py-10 text-gray-400">
    <p className="text-sm font-medium">No users found</p>
    {search && <p className="text-xs text-gray-500 mt-1">Try searching for something else</p>}
  </div>
);
