import { LazyLoadImage } from "react-lazy-load-image-component";
import ToggleSwitch from "../../../components/Buttons/ToggleSwitch";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import toast from "react-hot-toast";
import { useClearChat } from "../../../hooks/chat/chatEvents";
import { Virtuoso } from "react-virtuoso";
import { useAddAdmin, useRemoveAdmin, useRoomMembers } from "../../../hooks/chat/chatHook";
import { useMemo, useRef, useState } from "react";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { MoreVertical } from "lucide-react";
import { TbCancel } from "react-icons/tb";
import { AiOutlineDelete } from "react-icons/ai";
import { useBlockUser, useUnBlockUser } from "../../../hooks/user/userHook";
import { HiOutlineBellSlash } from "react-icons/hi2";
import { updateBlockedUser } from "../../../store/slices/chatList";
import type { IParticipant } from "../../../types/chat";


interface RoomMember {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    profilePic?: string;
    role?: string;
    isBlocked: boolean;
    isMuted: boolean;
}

const ChatMenu: React.FC = () => {
    const { activeRoom } = useAppSelector((state) => state.chat);
    const { user: loggedInUser } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();

    const isGroup = activeRoom?.type === "group";
    const isAdmin =
        !!loggedInUser &&
        activeRoom?.admins?.includes(loggedInUser._id);

    /* =========================
       GROUP MEMBERS (API)
    ========================== */
    const {
        members,
        totalCount,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useRoomMembers(isGroup ? activeRoom?._id : undefined);

    /* =========================
       MEMBERS LIST (unchanged logic)
    ========================== */
    const displayMembers = useMemo(() => {
        if (!activeRoom) return [];

        if (activeRoom.type === "group") {
            return members;
        }

        // DM logic untouched
        return activeRoom.participants as any;
    }, [activeRoom, members]);

    /* =========================
       UI STATES
    ========================== */
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [menuUserId, setMenuUserId] = useState<string | null>(null);

    const { clearchat } = useClearChat(
        loggedInUser?._id!,
        activeRoom?._id!
    );

    const handleClearChat = () => {
        clearchat();
        toast.success("Chat cleared successfully!");
    };

    /* =========================
       ACTION HANDLERS (UI ONLY)
    ========================== */
    const { mutateAsync: blockUser } = useBlockUser()
    const handleBlock = (userId: string, set: "blocked" | "muted", roomId: string) => {
        const payload = {
            user: userId,
            set,
            roomId: roomId ? roomId : null
        }
        blockUser(payload, {
            onSuccess: (_, variables) => {
                setMenuUserId(null);
                if (activeRoom?.type == "dm") {
                    const data = variables;

                    dispatch(updateBlockedUser({ roomId: data?.roomId!, targetUser: data?.user, set: data?.set }))
                }
            }
        })
    };

    const handleRemove = () => {
        toast.success("User removed from group");
        setMenuUserId(null);
    };

    const { mutateAsync: addNewAdmin } = useAddAdmin(activeRoom?._id!)
    const { mutateAsync: removeAdmin } = useRemoveAdmin(activeRoom?._id!)
    const handleMakeAdmin = (userId: string) => {
        addNewAdmin(userId)
        setMenuUserId(null);
    };

    const loadingRef = useRef(false);

    const otherUser = activeRoom?.participants.find(
        (u) => u._id !== loggedInUser?._id
    );

    const pic: string =
        activeRoom?.type === "group"
            ? activeRoom?.avatar || ""
            : otherUser?.profilePic || "";

    const name: string =
        activeRoom?.type === "group"
            ? activeRoom?.name || ""
            : otherUser?.fullName || "";

    const { mutateAsync: unMute } = useUnBlockUser()
    const handleUnMute = (id: string) => {
        unMute(id, {
            onSuccess: (res) => {
                setMenuUserId(null);
                if (activeRoom?.type == "dm") {
                    const data = res;

                    dispatch(updateBlockedUser({ roomId: data?.roomId, targetUser: data?.targetUser, set: data?.status }))
                }
            }
        })
    }
    let participant: IParticipant | undefined;

    if (activeRoom?.type === "dm") {
        participant = displayMembers.find(
            (u: IParticipant) => u._id !== loggedInUser?._id
        );
    }

    const handleRemoveAdmin = (id: string) => {
        removeAdmin(id)
        setMenuUserId(null);

    }


    return (
        <section className=" h-full relative border-l-5 theme-border flex flex-col justify-between">
            <div className="w-full border-b-2 theme-border">
                <h1 className="theme-text-primary text-lg font-semibold p-2">
                    Details
                </h1>
            </div>
            <section>
                <div className="flex flex-col items-center justify-center pt-3">
                    <div className={`h-35 w-35 p-1 ${pic.length > 1 && 'bg-gradient-to-r'} from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% rounded-full flex items-center justify-center overflow-hidden`}>
                        <LazyLoadImage
                            src={optimizeUrl(pic, 400) || '/profile.png'}
                            alt={pic}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h1 className="text-lg font-semibold theme-text-primary">{name}</h1>
                    {activeRoom?.type === "group" && <span className="text-sm theme-text-muted font-normal">{activeRoom?.description}</span>}
                </div>
            </section>
            <div className="w-full flex items-center justify-between">
                <h1 className="theme-text-primary text-sm font-semibold p-3">
                    Mute Messages
                </h1>
                <span className="scale-60">
                    <ToggleSwitch
                        value={participant?.isMuted || activeRoom?.isMuted!}
                        onClick={() => {
                            if (!participant) return;

                            if (participant.isMuted) {
                                handleUnMute(participant._id);
                            } else {
                                handleBlock(
                                    participant._id,
                                    "muted",
                                    activeRoom?._id!
                                );
                            }
                        }}
                    />
                </span>
            </div>
            {activeRoom?.type === "group" && <div className=" px-3 space-x-1 text-xs font-thin theme-text-muted">
                <span>{`total members`}</span>
                <span className="text-xs font-bold theme-text-primary">{totalCount}</span>


            </div>}
            <section className="flex-1 overflow-hidden border-t-5 theme-border ">
                <Virtuoso<RoomMember>
                    data={displayMembers}
                    className="custom-scrollbar"
                    endReached={() => {
                        if (isGroup && hasNextPage && !isFetchingNextPage) {
                            fetchNextPage().finally(() => {
                                loadingRef.current = false;
                            });
                        }
                    }}

                    components={{
                        Footer: () =>
                            isFetchingNextPage ? (
                                <div className="py-3 flex justify-center">
                                    <span className="text-xs theme-text-muted">Loading members…</span>
                                </div>
                            ) : null,
                    }}
                    itemContent={(index, member) => {
                        const isMe = member.id === loggedInUser?._id;
                        const isSelected = selectedUserId === member.id;

                        return (
                            <div
                                key={`${member.id}-${index}`}
                                onClick={() => {
                                    setSelectedUserId(member.id);
                                    setMenuUserId(null);

                                }}
                                className={`relative group ${member?.isBlocked && 'hover:cursor-not-allowed opacity-40'} flex items-center justify-between p-3 animate-fadeIn theme-hover-effect duration-300 cursor-pointer transition-colors
                                    ${isSelected
                                        ? "bg-[var(--theme-hover)]"
                                        : "hover:bg-[var(--theme-hover)]"
                                    }
                                    `}
                            >
                                <div className=" flex w-full justify-between items-center pr-3">
                                    <div className="flex items-center gap-3">

                                        <LazyLoadImage
                                            src={
                                                optimizeUrl(member.profilePic || "", 100) ||
                                                "/profile.png"
                                            }
                                            referrerPolicy="no-referrer"

                                            alt={member.username}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-7 h-7 rounded-full object-cover"
                                        />

                                        <div className="flex flex-col">
                                            <span
                                                className={`text-xs font-medium ${isMe ? "text-disable" : "theme-text-primary"
                                                    }`}
                                            >
                                                {isMe ? "You" : member.fullName}
                                            </span>
                                            <span className="text-[10px] theme-text-muted">
                                                {member.username}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center jutify-end gap-1 ">
                                        {(member.isMuted && !member.isBlocked) && <HiOutlineBellSlash />}
                                        {(member.role == "admin") && <div className={`${isMe && "mr-6"} text-[10px] border-2 dark:text-lime-600 theme-bg-card text-lime-400 px-2 rounded-full theme-border`}>admin</div>}
                                    </div>


                                </div>

                                {(isGroup && !isMe && !member?.isBlocked) && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuUserId(
                                                menuUserId === member.id ? null : member.id
                                            );
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-black/10 border cursor-pointer theme-border"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                )}

                                {menuUserId === member.id && (
                                    <div className="absolute dark:bg-black/50 bg-white/30 backdrop-blur-lg theme-text-primary z-60 top-2 right-10 border theme-border animate-fadeIn shadow-sm rounded-lg text-xs">
                                        <MenuItem
                                            label={`${member?.isMuted ? 'UnMute' : "Mute"}`}
                                            onClick={() => {
                                                if (member?.isMuted) {
                                                    handleUnMute(member.id)
                                                } else {
                                                    handleBlock(member.id, "muted", activeRoom?._id!)
                                                }
                                            }}
                                        />
                                        <MenuItem
                                            label={`${member?.isBlocked ? 'UnBlock' : "Block"}`}
                                            danger
                                            onClick={() => handleBlock(member.id, "blocked", activeRoom?._id!)}
                                        />

                                        {isAdmin && (
                                            <>

                                                <MenuItem
                                                    label={`${member.role == "admin" ? "Remove Admin" : "Add Admin"}`}
                                                    onClick={() => {
                                                        if (member.role == "memver") {
                                                            handleMakeAdmin(member.id)
                                                        }
                                                        handleRemoveAdmin(member.id)

                                                    }}
                                                />

                                                <MenuItem
                                                    label="Remove from group"

                                                    onClick={() => handleRemove()}
                                                />
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    }}
                />
            </section>


            <section className="flex flex-col items-start justify-center py-3 px-3 border-t-5 gap-1 theme-border dark:text-red-400 text-red-600">
                {(!participant?.isBlocked) && <button
                    className="fit py-1 rounded-md flex items-center text-sm justify-start gap-1 font-normal "
                    onClick={() => {
                        if (!isGroup) {
                            handleBlock(participant!._id, "blocked", activeRoom?._id!)
                        }
                    }}
                >

                    <TbCancel size={18} /> {isGroup ? "Leave Chat" : "Block"}
                </button>}

                <button
                    className="fit  py-1 rounded-md flex items-center text-sm justify-start gap-1 font-normal"
                    onClick={handleClearChat}
                >
                    <AiOutlineDelete size={18} /> Delete Chat

                </button>
            </section>

        </section>
    );
};

/* =========================
   SMALL MENU HELPERS
========================= */
const MenuItem = ({
    label,
    onClick,
    danger,
}: {
    label: string;
    onClick: () => void;
    danger?: boolean;
}) => (
    <div
        onClick={onClick}
        className={`px-3 py-2 cursor-pointer transition-colors ${danger
            ? "text-red-500 hover:bg-red-500/10"
            : "hover:bg-[var(--theme-hover)]"
            }`}
    >
        {label}
    </div>
);

export default ChatMenu;
