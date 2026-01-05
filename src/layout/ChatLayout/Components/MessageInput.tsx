import React, { useEffect, useRef, useState } from "react";
import { CiImageOn } from "react-icons/ci";
import MediaPreview from "./MediaPreview";
import { getSocket } from "../../../api/config/socketClient";
import type { User } from "../../../types";
import { Smile, Heart, Mic, Divide, Cross } from "lucide-react";
import { useTyping } from "../../../hooks/chat/chatEvents";
import EmojiPicker, { type EmojiClickData, Theme, EmojiStyle, SkinTones } from "emoji-picker-react";
import { useTheme } from "../../../hooks/theme/usetheme";
import { useAppSelector } from "../../../store/hooks";
import { stopEditingMessage } from "../../../store/slices/messages/editMessage";
import { useDispatch } from "react-redux";
import { closeReplyMessage } from "../../../store/slices/messages/replyMessage";
import { LiaReplySolid } from "react-icons/lia";
import { FiEdit3 } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import PrimaryButton from "../../../components/Buttons/PrimaryButoon";
import { optimisticEditMessage, useSendMedia, useSendMediaOptimistic, useSendMessage } from "../../../hooks/chat/chatHook";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { RxCross2 } from "react-icons/rx";
import { FaCog, FaUserSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useUnBlockUser } from "../../../hooks/user/userHook";
import { updateUnBlockedUser } from "../../../store/slices/chatList";

interface MessageInputProps {
    selectedFiles: File[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    loggedInUser: User | null;
    RoomCreater: string;
    user?: User | undefined | null
}

const MessageInput: React.FC<MessageInputProps> = ({
    selectedFiles,
    setSelectedFiles,
    loggedInUser,
    user: dmUser
}) => {
    const socket = getSocket();
    const { theme } = useTheme();
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [editMsgId, setEditingMessageId] = React.useState<string | null>(null);
    const dispatch = useDispatch();
    const [sendMessage, setSendMessage] = useState<string>("");

    const queryClient = useQueryClient()
    const { activeRoom } = useAppSelector((state) => state.chat)
    const { sendTextMessage } = useSendMessage({ socket, loggedInUser });
    const { mutateAsync: sendMedia } = useSendMedia();
    const { addTempMediaMessage } = useSendMediaOptimistic(loggedInUser);


    const handleSendMedia = async () => {
        if (!selectedFiles.length) {
            toast.error("Please select media");
            return;
        }

        const trimmed = sendMessage.trim();
        const result = addTempMediaMessage({
            roomId: activeRoom?._id ?? null,
            toUserId: dmUser?._id ?? null,
            files: selectedFiles,
            content: trimmed,
            replyTo: replymessageId ?? null,
        });

        if (!result) return;

        const { tempId } = result;
        const formData = new FormData();

        formData.append("senderId", loggedInUser!._id);
        formData.append("tempId", tempId);

        if (activeRoom?._id) {
            formData.append("roomId", activeRoom?._id);
        } else if (dmUser?._id) {
            formData.append("toUserId", dmUser._id);
        }

        if (trimmed) {
            formData.append("content", trimmed);
        }

        // 🔥 ONLY ADDITION (reply support)
        if (replymessageId) {
            formData.append("replyTo", replymessageId);
        }

        selectedFiles.forEach((file) => {
            formData.append("media", file);
        });


        formData.append("senderSocketId", socket?.id!);

        sendMedia(formData, {
            onError: (err: any) => {
                toast.error(err?.response?.data?.message || "Upload failed");
            },
        });

        setSelectedFiles([]);
        setSendMessage("");
        dispatch(closeReplyMessage());
    };

    const { messageId: replymessageId, openReply, isSender, content, replyingUser, media } = useAppSelector((state) => state.replyMessage);

    //send text message 
    const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedFiles.length > 0) {
            handleSendMedia();
            return;
        }
        const trimmed = sendMessage.trim();
        if (!trimmed || !loggedInUser) return;

        sendTextMessage({
            roomId: activeRoom?._id ?? null,
            toUserId: dmUser?._id ?? null,
            content: trimmed,
            replyTo: replymessageId ?? null,
        });
        setSendMessage("");
        if (replymessageId) {
            dispatch(closeReplyMessage());
        }
    };

    //select media files 
    const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const list = e.target.files;
        if (!list) return;
        const valid: File[] = [];
        Array.from(list).forEach((file) => {
            if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
                valid.push(file);
            }
        });
        if (valid.length === 0) {
            alert("Only image and video files are allowed.");
            return;
        }
        setSelectedFiles((prev) => [...prev, ...valid]);
    };

    //typing status    
    const { handleTyping } = useTyping(activeRoom?._id!, {
        id: loggedInUser?._id!,
        name: loggedInUser?.fullName!,
    });

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (newContent && newContent.length > 0) {
            setSendMessage(e.target.value);
        } else {
            setSendMessage(e.target.value);
            handleTyping();
        }
    };

    const handleShowEmoji = () => {
        setShowEmojiPicker((prev) => !prev);
    };

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setSendMessage((prev) => prev + emojiData.emoji);
    };

    const heart = "❤️";
    const handleSendLove = () => {
        if (!loggedInUser || !socket) return;
        sendTextMessage({
            roomId: activeRoom?._id ?? null,
            toUserId: dmUser?._id,
            content: heart,
            replyTo: replymessageId ?? null,
        });

    };

    const handleRemoveReply = () => {
        dispatch(closeReplyMessage());
    }

    const { editingMessageId, newContent } = useAppSelector((state) => state.editMessage);

    useEffect(() => {
        if (editingMessageId && newContent) {
            const copy = "-" + newContent;
            const updatedContent = copy.split("-")[1];

            setSendMessage(updatedContent); // safe assignment
            setEditingMessageId(editingMessageId); // your local tracking (optional)
        }
    }, [editingMessageId, newContent]);

    const handleremoveEditing = () => {
        dispatch(stopEditingMessage());
        setEditingMessageId(null);
        setSendMessage("");
    }

    const handleEdit = () => {
        if (!editingMessageId || !activeRoom?._id) return;
        if (!sendMessage.trim()) return;

        optimisticEditMessage({
            queryClient,
            roomId: activeRoom._id,
            messageId: editingMessageId,
            newContent: sendMessage.trim(),
        });

        // 🔌 socket sync
        socket?.emit("edit:message", {
            messageId: editingMessageId,
            roomId: activeRoom._id,
            content: sendMessage.trim(),
            userId: loggedInUser?._id
        });

        setEditingMessageId(null);
        setSendMessage("");
        handleremoveEditing()
    };

    const AcceptMessageRequest = (userId: string, roomId: string, createdBy: string | undefined) => {
        if (!socket) return;
        socket?.emit("accept:message_request", { userId, roomId, createdBy })
    }

    const participant = activeRoom?.participants.find((u) => u?._id !== loggedInUser?._id)

    const { mutateAsync: unblock } = useUnBlockUser()
    const handleUnblock = (id: string) => {
        unblock(id, {
            onSuccess: (res) => {
                const { targetUser, status, roomId } = res.data;
                dispatch(updateUnBlockedUser({ roomId, set: status, targetUser }))
            }
        })
    }
    return (
        <>
            {(activeRoom?.status == "request" && activeRoom.createdBy !== loggedInUser?._id) &&
                (<div className="w-full px-6 py-6 mb-5  backdrop-blur-xl border-t-2 animate-fadeIn transition-all easy-in-out theme-border flex flex-col items-center text-center">

                    <h3 className="text-lg font-semibold theme-text-primary tracking-wide mb-1 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Message Request
                    </h3>

                    <p className="text-[13px] text-gray-400 max-w-md leading-relaxed mb-4">
                        {isSender
                            ? "Your message request is awaiting approval. The user must Confirm it before the chat becomes active."
                            : "This user wants to send you a message. Confirm the request to start chatting or Cancel it to hide the conversation."}
                    </p>

                    {!isSender && (
                        <div className="flex items-center gap-4">
                            <PrimaryButton
                                onClick={() => AcceptMessageRequest(loggedInUser?._id!, activeRoom?._id!, activeRoom?.createdBy)}
                                fullWidth={false}
                                width="fit px-8 py-2"
                                label="accept"
                            />

                            <PrimaryButton
                                cancel
                                fullWidth={false}
                                width="fit px-8 py-2"
                                label="remove" />
                        </div>
                    )}

                    {/* Sender message */}
                    {isSender && (
                        <span className="text-[12px] text-gray-500 italic mt-2">
                            Waiting for user to respond…
                        </span>
                    )}
                </div>)}

            {((activeRoom?.status == "active" && !participant?.isBlocked)||(dmUser)) && (<div className="p-2 animate-fadeIn flex flex-col items-start  justify-center mt-1">

                <div className={`absolute top-22 ${showEmojiPicker ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-50'} duration-300`}>
                    <EmojiPicker
                        theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                        onEmojiClick={handleEmojiClick}
                        emojiStyle={EmojiStyle.GOOGLE}
                        height={350}
                        width={500}
                        defaultSkinTone={SkinTones.LIGHT}
                        searchPlaceHolder="Search Emojis..."
                        lazyLoadEmojis
                        previewConfig={{ showPreview: false }}
                    />
                    {
                        showEmojiPicker &&
                        <span className="absolute -right-4 hover:scale-120 duration-300 cursor-pointer" onClick={handleShowEmoji}><RxCross2 /></span>
                    }

                </div>

                <main
                    className={`relative w-full border-5 theme-border gap-3 dark:bg-transparent backdrop-blur-2xl duration-500 transition-all easy-in-out flex flex-col justify-center items-center relative p-3 ${(openReply || editMsgId) ? 'rounded-3xl' : 'rounded-4xl'}`}
                >

                    {
                        openReply &&
                        <div className=" w-full relative flex items-start justify-between gap-5 animate-fadeIn">

                            <section className="flex items-start justify-start gap-1 w-full">
                                <img src={optimizeUrl(replyingUser?.profilePic || '', 150) || './profile.png'} alt="user" className="w-8 h-8 rounded-xl shadow-sm" />
                                <span className="text-xs flex theme-text-muted">

                                    <LiaReplySolid size={18} strokeWidth={1} />

                                </span>

                                <h1 className="text-xs font-semibold theme-text-muted">reply {isSender ? 'yourself : ' : 'to : '}<span className="text-xs font-medium theme-text-primary">{content}</span></h1>

                            </section>
                            <IoIosClose size={28} onClick={handleRemoveReply} className="border-2 theme-border rounded-full theme-hover-effect duration-300" />
                        </div>
                    }
                    {
                        editMsgId &&
                        <div className=" w-full relative flex items-start justify-between gap-5 animate-fadeIn">

                            <section className="flex items-start justify-start gap-1 w-full">
                                <span className="text-xs flex theme-text-muted items-end gap-2">

                                    <FiEdit3 size={18} title="Cancel Editing" strokeWidth={3} />
                                    <h2 className="font-semibold text-xs">edit message. . . </h2>
                                </span>

                            </section>
                            <IoIosClose size={28} onClick={handleremoveEditing} className="border-2 theme-border rounded-full theme-hover-effect duration-300" />
                        </div>
                    }


                    {selectedFiles.length > 0 && (
                        <div className="relative w-full animate-fadeInX">
                            <MediaPreview
                                files={selectedFiles}
                                onRemove={(i) =>
                                    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
                                }
                            />
                        </div>
                    )}

                    <form
                        onSubmit={handleSend}
                        className={` rounded-full l flex gap-3 w-full
                            `}
                    >



                        <button type="button" className="cursor-pointer">
                            <Smile onClick={handleShowEmoji} />
                        </button>

                        <input
                            type="text"
                            className="w-full bg-transparent outline-none emoji-input"
                            placeholder="Message..."
                            value={sendMessage}
                            onChange={handleOnChange}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    if (editingMessageId) {
                                        handleEdit();
                                        return;
                                    } else {
                                        handleSend(e as any);
                                        setSendMessage("");
                                    }
                                }
                            }}
                        />

                        {((sendMessage.length > 0 || selectedFiles.length > 0) && !editingMessageId) && (
                            <button
                                type="submit"
                                className="theme-text-primary disabled:opacity-40"
                                disabled={!sendMessage.trim() && selectedFiles.length === 0}
                            >
                                Send
                            </button>
                        )}


                        {
                            editingMessageId && (
                                <span
                                    onClick={handleEdit}
                                    className="theme-text-muted cursor-pointer select-none"
                                >
                                    Update
                                </span>
                            )
                        }
                        {

                            !editingMessageId && <button type="button" className="cursor-pointer">
                                <Mic />
                            </button>
                        }

                        {sendMessage.trim().length === 0 && selectedFiles.length === 0 && (
                            <label className="theme-text-primary cursor-pointer">
                                <CiImageOn size={24} strokeWidth={1} />
                                <input
                                    type="file"
                                    accept="image/*,video/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleMediaSelect}
                                />
                            </label>
                        )}

                        <button onClick={handleSendLove} className="cursor-pointer">
                            <Heart />
                        </button>
                    </form>
                </main>
            </div>)}


            {(participant?.isBlocked) && (
                <div className="w-full absolute  flex items-center justify-center ">
                    <div className="max-w-md w-full rounded-2xl border theme-border mb-5 z-[9999] mr-5 bg-opacity-70 backdrop-blur-xl p-6 text-center animate-fadeIn">

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500/10">
                                <FaUserSlash className="text-red-500 text-2xl" />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg font-semibold theme-text-primary mb-2">
                            You’ve blocked {participant?.fullName || "this user"}
                        </h2>

                        {/* Description */}
                        <p className="text-sm theme-text-muted leading-relaxed mb-6">
                            Messaging is disabled for this conversation.
                            You can unblock the user to resume chatting, or manage this action
                            from your privacy settings.
                        </p>

                        {/* Actions */}
                        <div className="flex items-center justify-center gap-4">
                            {/* Primary */}

                            <PrimaryButton
                                label="Unblock User"
                                fullWidth={false}
                                width="px-6 py-2"
                                onClick={() => handleUnblock(participant?._id)}
                            />


                            {/* Secondary */}

                            <Link
                                to={'/settings/privacy_settings/blocked'}
                                className="flex items-center gap-2 px-5 py-2 text-sm rounded-2xl border-2 theme-border theme-text-muted hover:theme-text-primary hover:bg-gray-100/10 transition"
                            >
                                <FaCog size={14} />
                                Manage in Settings
                            </Link>

                        </div>
                    </div>
                </div>
            )

            }
        </>
    )
};

export default MessageInput;
