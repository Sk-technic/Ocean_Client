import React, { useState, useEffect, useMemo, useRef } from "react";
import type { ChatRoom, IParticipant, IUserRoom } from "../../../types/chat";
import SearchInput from "../../../components/searchHeader/SearchComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getSocket } from "../../../api/config/socketClient";
import { ClearActiveRoom, setActiveRoom } from "../../../store/slices/chatList";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { BiEdit } from "react-icons/bi";
import { clearUser } from "../../../store/slices/userSlice";
import { clearRoomMessages } from "../../../store/slices/messages/messages";
import { Virtuoso } from "react-virtuoso";
import '../chat.css'
import toast from "react-hot-toast";
import { useChatUsers } from "../../../hooks/chat/chatHook";
import Loader from "../../../components/Loader/Loader";
const ChatSidebar: React.FC<{
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;

  navigate: (path: string) => void;
  onSetRoomCreater: (value: string) => void;
  onSetBlockedMe: (value: boolean) => void;
  onSetGroupSlider: (value: boolean) => void;
}> = ({ selectedRoomId, onSetGroupSlider }) => {




  const { list: Users } = useAppSelector((state) => state.chat);

  const loading = useAppSelector((state) => state.chat.loading);
  const { user: loggedInUser } = useAppSelector((state) => state.auth);
  const { user: dmUser } = useAppSelector((state) => state.user)
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const prevRoomRef = useRef<string | null>(null);

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

  useEffect(() => {
    const room = Users.find((u) => u?.participants?.some((p: IParticipant) => p._id === dmUser?._id));
    if (room) {
      dispatch(setActiveRoom(room));
      return
    } else {
      dispatch(ClearActiveRoom())
      dispatch(clearRoomMessages())
    }
  }, [dmUser])

  const handleJoinRoom = (roomId: string) => {
    if (!socket || !roomId || !loggedInUser?._id) return;

    if (prevRoomRef.current && prevRoomRef.current !== roomId) {
      socket.emit("chat:leave", prevRoomRef.current, loggedInUser._id);
    }

    socket.emit("chat:join", roomId);
    console.log("user joined room:  ", roomId);

    prevRoomRef.current = roomId;
  };

  const handleSelectRoom = (u: ChatRoom) => {
    dispatch(clearRoomMessages())
    handleJoinRoom(u._id);
    dispatch(clearUser());
    dispatch(setActiveRoom(u));
  };



  const [isActiveTab, setIsActiveTab] = useState<'all' | 'unread' | 'blocked' | 'request'>('all');

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
    setIsActiveTab('request');
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
      if (isActiveTab === "request") {
        return (u.status == "request");
      }
      return true;
    });
  }, [filteredUsers, isActiveTab, loggedInUser?._id]);

  const { isConnected } = useAppSelector(state => state.socket)
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatUsers(loggedInUser?._id, isConnected);


  return (
    <aside className="w-[25vw] h-full  border-r-5 theme-border  flex flex-col overflow-hidden">
      <section className="flex flex-col justify-between h-full">

        <div className="flex flex-col h-full gap-5">
          <div className="flex w-full h-fit items-end justify-between px-3 pt-5">
            <div className="w-fit h-fit  flex items-center gap-3 justify-center bg-transparent">
              <LazyLoadImage
                loading="lazy"
                src={optimizeUrl(loggedInUser?.profilePic || '') || "./profile-dummy.png"}
                referrerPolicy="no-referrer"
                alt={loggedInUser?.fullName}
                className={`w-13 h-13 rounded-full overflow-hodden object-cover transition-opacity duration-150`}
              />
              <div className="flex flex-col">
                <p className="flex items-center justify-start">
                  <span className="text-xl font-semibold">{loggedInUser?.username}</span>
                </p>
                <span className="text-sm text-disable">{loggedInUser?.fullName}</span>
              </div>
            </div>
            <div className="" onClick={() => onSetGroupSlider(true)}>
              <BiEdit size={30} />
            </div>
          </div>

          <div className="px-3">

            <SearchInput
              name="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className="rounded-md "
            />
          </div>
          <div className="w-full grid grid-cols-4 gap-5 px-3 text-sm font-semibold theme-text-secondary">
            <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab == "all" && 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={() => handleAlllist()}>
              all
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "all" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab == "unread" && 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={() => handleUnreadlist()}>
              unread
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "unread" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab == "request" && 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={() => handleRequestlist()}>
              request
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "request" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center  border border-transparent hover:cursor-pointer ${isActiveTab == "blocked" && 'theme-bg-secondary duration-300 theme-border rounded-lg'}`} onClick={() => handleMutedlist()}>
              blocked
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "blocked" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>

          </div>
          <div className="flex flex-col border-t-5 theme-border h-full">
            {loading ? (
              <SidebarSkeletonLoader />
            ) : tabFilteredUsers.length > 0 ? (
              <Virtuoso
                data={tabFilteredUsers}
                initialTopMostItemIndex={0}
                className="custom-scrollbar"

                endReached={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage(); // 🔥 next cursor automatically use hoga
                  }
                }}

                components={{
                  Footer: () =>
                    isFetchingNextPage ? (
                      <div className="py-3 text-center text-sm text-gray-400">
                        <Loader message="loading.." />
                      </div>
                    ) : null,
                }}

                itemContent={(index, u) => {
                  const participant = u?.participants?.find(
                    (p: IParticipant) => p._id !== loggedInUser?._id
                  );
                  const count = u?.participants?.find(
                    (p: IParticipant) => p?._id == loggedInUser?._id
                  );

                  if (!participant) return null;

                  return (
                    <SidebarUserCard
                      key={`${u._id}-${participant._id}`}
                      user={u}
                      participant={{
                        ...participant,
                        roomId: u._id,
                        unreadCount: count?.unreadCount ?? 0,
                      }}
                      selected={selectedRoomId === u._id}
                      BlockedMe={u?.blockedMe ?? false}
                      searchQuery={debouncedSearch}
                      onClick={() => {
                        handleSelectRoom(u);
                      }}
                    />
                  );
                }}
              />
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
  BlockedMe?: boolean;
  searchQuery: string;

}) => {
  const [loaded, setLoaded] = useState(false);
  const { user: loggedInUser } = useAppSelector((state) => state.auth)
  const {activeRoom} = useAppSelector(state=>state.chat)
  // console.log(activeRoom?.lastMessageMeta?.text);
  
  const preview = user.lastMessageMeta?.text || "";
  
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
      className={`flex items-center justify-between px-3 py-2 ${participant?.isBlocked && 'opacity-50 '} gap-3 theme-text-primary cursor-pointer select-none 
        transition-colors duration-150 ease-in-out
        ${selected ? "bg-[var(--text-disabled)] text-primary" : "hover:bg-zinc-500/40"}
      `}
    >
      <section className="w-full flex items-center h-full justify-start gap-3">

        <div className="relative w-13 h-13 rounded-full flex-shrink-0">
          {(!loaded) && <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-r from-zinc-700 to-gray-700 animate-pulse" />}
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
              } transition-opacity duration-200`}
          />
          {(!BlockedMe && participant?.isOnline) &&
           <span className={`w-4 h-4 absolute bottom-1 right-[2px] p-[1.8px] theme-bg-primary flex items-center justify-center rounded-full`}>
            <div className="w-full h-full bg-lime-500 rounded-full"/>
            </span>
          }
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className={`text-[14px] truncate font-medium`}>{highlightText(participant.fullName || "", searchQuery)}</h1>
          <span className={` flex items-center justify-start gap-1`}>
            {
              (user.lastMessageMeta?.sender?.toString() == loggedInUser?._id.toString()) ?
                <span className="text-xs text-disable ">{preview !== "" ? 'you' : `${participant?.username}`}</span>
                :null
            }
            <span className="theme-text-muted truncate flex text-[12px]">
              {preview.length > 23 ? preview.slice(0, 25) + "..." : preview}
            </span>

          </span>
        </div>
      </section>

      {(participant?.unreadCount != 0) && (
        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400   rounded-full flex items-center justify-center text-xs">
          {/* <span className="text-zinc-800">{participant?.unreadCount ?? 0}</span> */}
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
