import React, { useState, useEffect, useMemo } from "react";
import type { ChatRoom, IParticipant, IUserRoom, Message } from "../../../types/chat";
import SearchInput from "../../../components/searchHeader/SearchComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getSocket } from "../../../api/config/socketClient";
import { setActiveRoom, updateCount, updateLastMessage } from "../../../store/slices/chatList";
import { optimizeUrl } from "../../../utils/imageOptimize";

const ChatSidebar: React.FC<{
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
  onSelectUser: (user: IParticipant) => void;
  onSelectReceiver: (receiver: string) => void;
  navigate: (path: string) => void;
  onSetRoomCreater: (value: string) => void;
  onSetBlockedMe: (value: boolean) => void;
}> = ({ selectedRoomId, onSelectRoom, onSelectUser, onSelectReceiver, navigate, onSetRoomCreater,onSetBlockedMe }) => {
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
  const optimizeUrl = (url: string) => url.replace("/upload/", "/upload/w_300,q_auto,f_auto/");
  const socket = getSocket()
  const dispatch = useAppDispatch();

  const handleReadMessages = (data: { userId: string, roomId: string }) => {
    const socket = getSocket()
    socket?.emit("room:read", data)
  }

  useEffect(() => {
    if (!socket) return;
    const handleResetCount = (updatedCounts: ChatRoom) => {

      const myState = updatedCounts?.participants?.find(
        (p: any) => p.user === loggedInUser?._id
      );
      dispatch(updateCount({ roomId: updatedCounts?._id, userId: loggedInUser?._id!, count: myState?.unreadCount ?? 0 }))
    }

    const handleUpdateRoom = (message: Message) => {
      dispatch(updateLastMessage({ roomId: message?.roomId, message: message }))
    }
    socket?.on("room:unread:reset", handleResetCount)
    socket?.on("unsend:update:room", handleUpdateRoom)

    return () => {
      socket?.off("room:unread:reset", handleResetCount)
      socket?.off("unsend:update:room", handleUpdateRoom)
    }
  }, [socket])

  const [isActiveTab, setIsActiveTab] = useState<'all' | 'unread' | 'blocked' | 'requested'>('all');

  const handleMutedlist = () => {
    setIsActiveTab('blocked');
  }
  const handleAlllist = () => {
    setIsActiveTab('all');
  }
  const handleUnreadlist = () => {
    setIsActiveTab('unread');
  }
  const handleRequestlist = () => {
    setIsActiveTab('requested');
  } 

  const tabFilteredUsers = useMemo(() => {
  if (!filteredUsers) return [];

  if (isActiveTab === "all") return filteredUsers;

  return filteredUsers.filter((u) => {
    const participant = u.participants.find(
      (p: any) => p._id !== loggedInUser?._id
    );
    const me = u.participants.find(
      (p: any) => p._id === loggedInUser?._id
    );

    if (!participant) return false;

    if (isActiveTab === "blocked") {
      return participant.isBlocked === true;
    }

    if (isActiveTab === "unread") {
      return (me?.unreadCount ?? 0) > 0;
    }
if (isActiveTab === "requested") {
      return (u.status == "request");
    }
    return true;
  });
}, [filteredUsers, isActiveTab, loggedInUser?._id]);

  return (
    <aside className="w-[25vw] h-full  border-r-2 theme-border  flex flex-col overflow-hidden">
      <section className="flex flex-col justify-between h-full">

        <div className="flex flex-col h-full gap-3">
          <div className="flex w-full rounded-xl h-fit items-end  justify-start pt-5 px-3 gap-2">
            <div className="w-fit h-fit  flex items-center justify-center bg-transparent theme-border border rounded-full">
              <LazyLoadImage
                loading="lazy"
                src={optimizeUrl(loggedInUser?.profilePic || '') || "./profile-dummy.png"}
                referrerPolicy="no-referrer"
                alt={loggedInUser?.fullName}
                className={`w-13 h-13 rounded-full overflow-hodden object-cover transition-opacity duration-150`}
              />
            </div>
            <div className="flex flex-col">
              <p className="flex items-center justify-start">
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
            onClear={()=>setSearch('')}
            className="px-3"
            />
            <div className="w-full grid grid-cols-4 gap-5 px-3 text-sm font-semibold theme-text-secondary">
              <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab=="all"&& 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={()=>handleAlllist()}>
                all
                <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab=="all"&& 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
                </span>
              <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab=="unread"&& 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={()=>handleUnreadlist()}>
                unread
                <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab=="unread"&& 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
                </span>
                <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab=="requested"&& 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={()=>handleRequestlist()}>
                requested
                <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab=="requested"&& 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
                </span>
              <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab=="blocked"&& 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={()=>handleMutedlist()}>
                blocked
                <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab=="blocked"&& 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
                </span>

            </div>
          <div className="flex flex-col border-t-2 theme-border overflow-y-auto h-full custom-scrollbar">
            {loading ? (
              <SidebarSkeletonLoader />
            ) : filteredUsers.length > 0 ? (
              tabFilteredUsers.map((u) => {
                const participant = u.participants.find((p:any) => p._id !== loggedInUser?._id);
                const count = u.participants.find((p:any) => p?._id == loggedInUser?._id)
                const CountParam = {
                  userId: loggedInUser?._id!,
                  roomId: u._id
                }
                if (!participant) return null;
                return (
                  <SidebarUserCard
                    key={`${u._id}-${participant._id}-${participant.isOnline}`}
                    user={u}
                    participant={{ ...participant, roomId: u._id, unreadCount: count?.unreadCount ?? 0 }}
                    selected={selectedRoomId === u._id}
                    BlockedMe={u?.blockedMe??false}
                    searchQuery={debouncedSearch}
                    onClick={() => {
                      if(participant?.isBlocked)return;
                      navigate("/message");
                      onSelectRoom(u._id);
                      onSelectUser({ ...participant, roomId: u._id });
                      onSelectReceiver(participant._id);
                      handleReadMessages(CountParam)
                      onSetRoomCreater(u?.createdBy?.toString()!)
                      onSetBlockedMe(u?.blockedMe??false)
                      dispatch(setActiveRoom(u))

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
  BlockedMe,
  searchQuery,
}: {
  user: IUserRoom;
  participant: IParticipant;
  selected: boolean;
  onClick: () => void;
  BlockedMe?:boolean;
    searchQuery: string;

}) => {
  const [loaded, setLoaded] = useState(false);
  const { user: loggedInUser } = useAppSelector((state) => state.auth)

  const preview = user.lastMessageMeta?.text || "No messages";
const highlightText = (text: string, query: string) => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, "ig");
  return text.split(regex).map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span
        key={i}
        className="bg-gradient-to-r from-sky-500/70 to-purple-500/70 text-blue-100 px-0.5 py-0.5 rounded-sm"
      >
        {part}
      </span>
    ) : (
      part
    )
  );
};
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 py-2 ${participant?.isBlocked && 'opacity-50 hover:cursor-not-allowed'} gap-3 theme-text-primary cursor-pointer select-none 
        transition-colors duration-150 ease-in-out
        ${selected ? "bg-[var(--text-disabled)] text-primary" : "hover:bg-zinc-500/40"}
      `}
    >
      <section className="flex items-center justify-start gap-3">

        <div className="relative w-13 h-13 rounded-full flex-shrink-0">
          {(!loaded) && <div className="absolute inset-0 rounded-full overflow-hidden bg-gray-700 animate-pulse" />}
          <LazyLoadImage
            loading="lazy"
            src={optimizeUrl(participant?.profilePic || '', 200) || "/profile.png"}
            alt={participant.fullName}
            referrerPolicy="no-referrer"
            onLoad={() => {
              if (participant?.profilePic == '' || null) {
                setLoaded(false)
              }
              setLoaded(true)
            }}
            className={`w-12 h-12 rounded-full overflow-hidden object-cover ${loaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-150`}
          />
          {!BlockedMe && <span
            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ${participant.isOnline ? 'border-zinc-100 border-2' : ''}
          ${participant.isOnline ? "bg-lime-500 scale-100 shadow-sm" : ''} 
          transition-all duration-300 ease-out`}
            title={participant.isOnline ? "Online" : "Offline"}
          />}
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className={`text-[14px] truncate font-medium`}>{highlightText(participant.fullName || "", searchQuery)}</h1>
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
