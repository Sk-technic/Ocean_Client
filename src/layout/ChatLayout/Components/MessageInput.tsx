import React, { useEffect } from "react";
import { CiImageOn } from "react-icons/ci";
import MediaPreview from "./MediaPreview";
import { getSocket } from "../../../api/config/socketClient";
import type { User } from "../../../types";
import { Smile, Heart, Mic, Divide } from "lucide-react";
import { useTyping } from "../../../hooks/chat/chatEvents";
import EmojiPicker, { type EmojiClickData, Theme, EmojiStyle, SkinTones } from "emoji-picker-react";
import { useTheme } from "../../../hooks/theme/usetheme";
import { useAppSelector } from "../../../store/hooks";
import { stopEditingMessage } from "../../../store/slices/messages/editMessage";
import { useDispatch } from "react-redux";
import { closeReplyMessage } from "../../../store/slices/messages/replyMessage";
import { LiaReplySolid } from "react-icons/lia";
import { FiEdit2 } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";
import PrimaryButton from "../../../components/Buttons/PrimaryButoon";

interface MessageInputProps {
    sendMessage: string;
    setSendMessage: React.Dispatch<React.SetStateAction<string>>;
    onSend: () => void;
    selectedFiles: File[];
    setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>;
    loggedInUser: User | null;
    receiver: string | null;
    selectedRoomId: string;
    RoomCreater: string;

}

const MessageInput: React.FC<MessageInputProps> = ({
    sendMessage,
    setSendMessage,
    onSend,
    selectedFiles,
    setSelectedFiles,
    loggedInUser,
    receiver,
    selectedRoomId,
    RoomCreater
}) => {
    const socket = getSocket();
    const { theme } = useTheme();
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [editMsgId, setEditingMessageId] = React.useState<string | null>(null);
    const dispatch = useDispatch();

    const { messageId: replymessageId, openReply, isSender, content, replyingUser } = useAppSelector((state) => state.replyMessage);
    const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (selectedFiles.length > 0) {
            onSend();
            return;
        }

        const trimmed = sendMessage.trim();

        if (!trimmed || !loggedInUser || !receiver) return;

        socket?.emit("send:message", {
            senderId: loggedInUser._id,
            receiverId: receiver,
            content: trimmed,
            roomId: selectedRoomId,
            messageType: "text",
            replyTo: replymessageId ?? null,
        });

        setSendMessage("");
        if (replymessageId) {
            dispatch(closeReplyMessage());
        }
    };

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

    const { handleTyping } = useTyping(selectedRoomId, {
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
        if (!loggedInUser || !receiver) return;
        socket?.emit("send:message", {
            senderId: loggedInUser._id,
            receiverId: receiver,
            content: heart,
            roomId: selectedRoomId,
            messageType: "text",
        });
    };

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
        if (!loggedInUser || !receiver || !editingMessageId) return;
        socket?.emit("message:edit", {
            messageId: editingMessageId,
            roomId: selectedRoomId,
            newContent: sendMessage,
            userId: loggedInUser._id,
        });
        dispatch(stopEditingMessage());
        setEditingMessageId(null);
        setSendMessage("");
    }


    const handleRemoveReply = () => {
        dispatch(closeReplyMessage());
    }

    const { list: Users } = useAppSelector((state) => state.chat)
    const AcceptMessageRequest = (userId: string, roomId: string, createdBy: string) => {
        if (!socket) return;
        socket?.emit("accept:message_request", { userId, roomId, createdBy })
    }
    let RoomStatus = Users.find((r) => r?._id == selectedRoomId)
    return (
        (RoomStatus?.status == "request" && RoomCreater != loggedInUser?._id) ?
            (<div className="w-full px-6 py-6 mb-5 backdrop-blur-xl border-t-2 theme-border flex flex-col items-center text-center">

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
                            onClick={() => AcceptMessageRequest(loggedInUser?._id!, selectedRoomId, RoomCreater)}
                           fullWidth={false}
                           width="fit px-8 py-2"
                            label="Confirm"
                            
                        />

                        <PrimaryButton 
                        cancel
                        fullWidth={false}
                           width="fit px-8 py-2"
                            label="Cancel"/>
                    </div>
                )}

                {/* Sender message */}
                {isSender && (
                    <span className="text-[12px] text-gray-500 italic mt-2">
                        Waiting for user to respond…
                    </span>
                )}
            </div>)
            :
            (<div className="flex items-center justify-center mt-1">
                <form
                    onSubmit={handleSend}
                    className="w-full flex items-center gap-3 rounded-full p-3 border-2 theme-border relative"
                >
                    {selectedFiles.length > 0 && (
                        <MediaPreview
                            files={selectedFiles}
                            onRemove={(i) =>
                                setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }
                        />
                    )}

                    {showEmojiPicker && (
                        <div
                            className="absolute bottom-14 left-0 z-50 animate-slideUp transition-all duration-300"
                        >
                            <EmojiPicker
                                theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
                                onEmojiClick={handleEmojiClick}
                                emojiStyle={EmojiStyle.GOOGLE}
                                height={350}
                                width={350}
                                defaultSkinTone={SkinTones.LIGHT}
                                searchPlaceHolder="Search Emojis..."
                                lazyLoadEmojis
                                previewConfig={{ showPreview: false }}

                            />
                        </div>
                    )}

                    <button type="button">
                        <Smile onClick={handleShowEmoji} />
                    </button>
                    {editMsgId && <div className=" flex items-start justify-start gap-2 absolute bottom-13 z-90 border-t theme-border w-[50%] py-3 bg-black/30 backdrop-blur-sm text-md hover:cursor-pointer" onClick={handleremoveEditing}>
                        <FiEdit2 size={18} title="Cancel Editing" strokeWidth={2} />
                        <span className="text-[14px]">Edit message</span>
                        <div className="absolute top-1 right-1" onClick={handleRemoveReply}>
                            <IoIosClose size={25} />
                        </div>
                    </div>}

                    {
                        openReply && <div className=" flex items-start justify-start gap-2 absolute bottom-13 z-90 border-t theme-border w-[35%] py-2 bg-black/30 backdrop-blur-sm text-md hover:cursor-pointer">
                            <LiaReplySolid size={20} title="Cancel Reply" />
                            <div className="flex flex-col items-start justify-center gap-1">
                                <span className="text-[11px]"><span>Reply to </span><span className="font-semibold text-[14px]">{`${isSender ? 'youself' : `${replyingUser}`}`}</span></span>
                                <span className="text-xs">{content && content.length > 30 ? content.slice(0, 30) + ' ...' : content ?? ''}</span>
                            </div>
                            <div className="absolute top-1 right-1" onClick={handleRemoveReply}>
                                <IoIosClose size={25} />
                            </div>
                        </div>
                    }
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
                                className="theme-text-muted hover:cursor-pointer select-none"
                            >
                                Update
                            </span>
                        )
                    }
                    {

                        !editingMessageId && <button type="button">
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

                    <button onClick={handleSendLove}>
                        <Heart />
                    </button>
                </form>
            </div>
            ));
};

export default MessageInput;
