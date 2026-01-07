import React, { useState, useEffect, useMemo, useRef } from "react";
import type { ChatRoom, IParticipant } from "../../../types/chat";
import SearchInput from "../../../components/searchHeader/SearchComponent";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { getSocket } from "../../../api/config/socketClient";
import { addChatRoom, ClearActiveRoom, setActiveRoom, updateCount } from "../../../store/slices/chatList";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { BiGroup } from "react-icons/bi";
import { clearUser } from "../../../store/slices/userSlice";
import { clearRoomMessages } from "../../../store/slices/messages/messages";
import { Virtuoso } from "react-virtuoso";
import '../chat.css'
import { useChatUsers } from "../../../hooks/chat/chatHook";
import Loader from "../../../components/Loader/Loader";
import { HiOutlineBellSlash } from "react-icons/hi2";

const ChatSidebar: React.FC<{
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;

  navigate: (path: string) => void;
  onSetRoomCreater: (value: string) => void;
  onSetGroupSlider: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ selectedRoomId, onSetGroupSlider }) => {




  const { list: Users, activeRoom } = useAppSelector((state) => state.chat);

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

    return Users.filter((u) => {
      if (u.type === "group") {
        return u.name
          ?.toLowerCase()
          .includes(debouncedSearch);
      }

      const p = u.participants.find(
        (p) => p._id !== loggedInUser?._id
      );
      if (!p) return false;

      return (
        p.fullName?.toLowerCase().includes(debouncedSearch) ||
        p.username?.toLowerCase().includes(debouncedSearch)
      );
    });
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

  const [isActiveTab, setIsActiveTab] = useState<'all' | 'unread' | 'group' | 'request'>('all');

  const handleGrouplist = () => {
    setIsActiveTab('group');
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
    
      if (u.type === "group") {
        if (isActiveTab === "request") {
          return u.status === "request";
        }
        return true;
      }

      const participant = u.participants.find(
        (p: any) => p._id !== loggedInUser?._id
      );
      const me = u.participants.find(
        (p: any) => p._id === loggedInUser?._id
      );

      if (!participant) return false;


      if (isActiveTab === "unread") {
        return (me?.unreadCount ?? 0) > 0;
      }

      if (isActiveTab === "request") {
        return u.status === "request";
      }
  if (isActiveTab === "group") {
        return participant.type === "group";
      }
      return true;
    });
  }, [filteredUsers, isActiveTab, loggedInUser?._id]);


  // const { isConnected } = useAppSelector(state => state.socket)
  const {
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChatUsers(loggedInUser?._id);


  useEffect(() => {
    const handleUnreadCount = (key: boolean) => {
      if (!key && !socket) return
      dispatch(updateCount({ roomId: activeRoom?._id!, userId: loggedInUser?._id!, count: 0 }))
    }
    socket?.on("room:unread:reset", handleUnreadCount)

    return () => {
      socket?.off("room:unread:reset", handleUnreadCount)
    }
  }, [socket, activeRoom])

  useEffect(() => {
    const handleUnreadCount = ({ roomId, count }: { count: number, roomId: string }) => {
      console.log(count, roomId);

      dispatch(updateCount({ roomId, userId: loggedInUser?._id!, count }))
    }

    const handleNewGroup = (room: ChatRoom) => {
      dispatch(addChatRoom(room))
    }
    socket?.on("room:UnreadCount", handleUnreadCount)
    socket?.on("NEW_GROUP_CREATED", handleNewGroup)
    return () => {
      socket?.off("room:UnreadCount", handleUnreadCount)
      socket?.off("NEW_GROUP_CREATED", handleNewGroup)

    }
  }, [socket, activeRoom])

  return (
    <aside className="w-[25vw] h-full  border-r-5 theme-border  flex flex-col overflow-hidden">
      <section className="flex flex-col justify-between h-full">

        <div className="flex flex-col h-full gap-5 ">
          <div className="flex w-full h-fit items-end justify-between p-3 border-b-5 theme-border">
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
            <div className="duration-300 cursor-pointer theme-hover-effect p-1 rounded-full flex items-center justify-center theme-text-primary" onClick={() => onSetGroupSlider(prev => !prev)}>
              <BiGroup size={25} />
            </div>
          </div>

          <div className="px-3">

            <SearchInput
              name="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              className=""
            />
          </div>
          <div className="w-full grid grid-cols-4 gap-5 px-3 text-sm font-light">
            <span className={`group relative p-1 text-center cursor-pointer theme-text-muted ${isActiveTab == "all" && 'font-medium duration-500 '}`} onClick={() => handleAlllist()}>
              All
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "all" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center cursor-pointer theme-text-muted ${isActiveTab == "unread" && 'font-medium duration-500 '}`} onClick={() => handleUnreadlist()}>
              Unread
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "unread" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center cursor-pointer theme-text-muted ${isActiveTab == "request" && 'font-medium duration-500 '}`} onClick={() => handleRequestlist()}>
              Request
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "request" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>
            <span className={`group relative p-1 text-center cursor-pointer theme-text-muted ${isActiveTab == "group" && 'font-medium duration-500 '}`} onClick={() => handleGrouplist()}>
              Groups
              <div className={`absolute rounded-full w-0 duration-300 transition-all easy-in-out group-hover:w-full ${isActiveTab == "group" && 'w-full'} -bottom-2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-purple-500`}></div>
            </span>

          </div>
          <div className="flex flex-col h-full">
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
                  // 🟢 GROUP
                  if (u.type === "group") {
                    return (
                      <SidebarUserCard
                        key={`${u._id}-${index}`}
                        user={u}
                        participant={{
                          _id: u._id,
                          fullName: u.name,
                          username: u.name,
                          profilePic: u.avatar,
                          unreadCount: u.unreadCount ?? 0,
                          roomId: u._id,
                          status: u.status,
                        } as any}
                        selected={selectedRoomId === u._id}
                        BlockedMe={false}
                        searchQuery={debouncedSearch}
                        onClick={() => handleSelectRoom(u)}
                      />
                    );
                  }

                  // 🟢 DM
                  const participant = u.participants.find(
                    (p: IParticipant) => p._id !== loggedInUser?._id
                  );

                  if (!participant) return null;

                  return (
                    <SidebarUserCard
                      key={`${u._id}-${participant._id}`}
                      user={u}
                      participant={{
                        ...participant,
                        roomId: u._id,
                        unreadCount: u.unreadCount ?? 0,
                        status: u.status,
                      }}
                      selected={selectedRoomId === u._id}
                      BlockedMe={u.blockedMe ?? false}
                      searchQuery={debouncedSearch}
                      onClick={() => handleSelectRoom(u)}
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
  user: ChatRoom;
  participant: IParticipant;
  selected: boolean;
  onClick: () => void;
  BlockedMe?: boolean;
  searchQuery: string;

}) => {
  const [loaded, setLoaded] = useState(false);
  const { user: loggedInUser } = useAppSelector((state) => state.auth)
  // const { activeRoom } = useAppSelector(state => state.chat)

  const preview =
    user.lastMessageMeta?.text ||
    (user.type === "group" ? user.description || "" : "");
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

  const displayName =
    user.type === "group"
      ? user.name
      : participant.username;


  const displayAvatar =
    user.type === "group"
      ? user.avatar
      : participant.profilePic;
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between animate-fadeIn px-3 py-2 ${participant?.isBlocked && 'opacity-50 '} gap-3 theme-text-primary cursor-pointer select-none 
        transition-colors duration-150 ease-in-out
        ${selected ? "bg-[var(--text-disabled)] text-primary" : "hover:bg-zinc-500/40"}
      `}
    >
      <section className="w-full flex items-center justify-between h-full justify-start gap-3">

        <div className="relative w-13 h-13 rounded-full flex-shrink-0">
          {(!loaded) && <div className="absolute inset-0 rounded-full overflow-hidden bg-gradient-to-r from-zinc-700 to-gray-700 animate-pulse" />}
          <LazyLoadImage
            loading="lazy"
            src={optimizeUrl(displayAvatar || '', 200) || "/profile.png"}
            alt={displayName}
            referrerPolicy="no-referrer"
            onLoad={() => {
              if (displayAvatar == '' || null) {
                setLoaded(false)
              }
              setLoaded(true)
            }}
            className={`w-12 h-12 rounded-full overflow-hidden object-cover ${loaded ? "opacity-100" : "opacity-0"
              } transition-opacity duration-200`}
          />
          {(!BlockedMe && participant?.isOnline && participant?.status == "active") &&
            <span className={`w-4 h-4 absolute bottom-1 right-[2px] p-[1.8px] theme-bg-primary flex items-center justify-center rounded-full`}>
              <div className="w-full h-full bg-lime-500 rounded-full" />
            </span>
          }
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className={`text-[14px] truncate font-normal`}>{highlightText(displayName || '', searchQuery)}</h1>
          <span className={` flex items-center justify-start gap-1`}>
            {
              (user.lastMessageMeta?.sender?.toString() == loggedInUser?._id.toString()) ?
                <span className="text-xs text-disable ">{preview !== "" ? 'you' : `${participant?.username}`}</span>
                : null
            }
            <span className="theme-text-muted truncate flex text-[12px]">
              {preview.length > 23 ? preview.slice(0, 25) + "..." : preview}
            </span>

          </span>
        </div>
</section>
          { (participant?.isMuted && !participant?.isBlocked)&&<HiOutlineBellSlash size={20} strokeWidth={2}/>}      

      {(participant?.unreadCount != 0) && (
        <div className="w-5 h-5 theme-bg-secondary rounded-full flex items-center justify-center text-xs">
          <span className="theme-text-primary">{participant?.unreadCount ?? 0}</span>
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
