import React, { useEffect, useState, useMemo, useCallback } from "react";
import type { Message } from "../../../types/chat";
import { EllipsisVertical, Smile } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { renderWithEmoji } from "../../../utils/emojiRender";
import { useUnsendMessage } from "../../../hooks/chat/chatEvents";
import { getSocket } from "../../../api/config/socketClient";
import { TbCopy } from "react-icons/tb";
import { LiaReplySolid } from "react-icons/lia";
import { useTimeAgo } from "../../../utils/timecoverter";
import { HiMiniArrowPath } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { setEditMessage } from "../../../store/slices/messages/editMessage";
import { setReplyMessage } from "../../../store/slices/messages/replyMessage";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { useAppSelector } from "../../../store/hooks";
import MediaGrid from "./MediaGrid";
import Loader from "../../../components/Loader/Loader";
import { TbPencil } from "react-icons/tb";

interface IBubble {
  message: Message;
  prevMessage?: Message;
  nextMessage?: Message;
  onMediaLoaded?: () => void;
}

const Avatar: React.FC<{ src?: string; show: boolean }> = React.memo(
  ({ src, show }) => {
    if (!show) return <div className="w-8" />;
    return (
      <LazyLoadImage
        src={optimizeUrl(src || '', 200) || "/profile.png"}
        alt=""
        className="w-8 h-8 rounded-full object-cover"
        loading="lazy"
        width={32}
        height={32}
        effect="opacity"
      />
    );
  }
);
Avatar.displayName = "Avatar";

const ReplyPreview: React.FC<{ replyTo: any; isSender: boolean }> = React.memo(
  ({ replyTo, isSender }) => {
    if (!replyTo) return null;

    const isMediaReply = typeof replyTo === "object" && (replyTo?.media?.length ?? 0) > 0;

    return (
      <span
        className={`text-xs bg-transparent w-20  h-fit w-full flex ${isSender ? "flex-row-reverse" : ""} items-start justify-start gap-1`}
      >
        {!isMediaReply && <div className="border-3 rounded-full theme-border h-full" />}
        <span>
          <LiaReplySolid size={20} />
        </span>
        <span className={`w-fit ${isMediaReply ? "" : "bg-zinc-500/50 rounded-2xl px-2"} backdrop-blur-lg`}>
          {!isMediaReply && <div className="text-[12px] p-1 ">{replyTo?.content}</div>}
          {isMediaReply && (
            <div className="rounded-xl overflow-hidden">
              <LazyLoadImage
                loading="lazy"
                src={replyTo?.media?.[0]?.thumbnail}
                className="w-20 object-cover h-40 rounded-xl"
                alt="reply preview"
                width={80}
                height={160}
                effect="opacity"
              />
            </div>
          )}
        </span>
        {
          <img
            className="object-cover w-5 h-5 rounded-full theme-border-secondary"
            src={optimizeUrl(replyTo?.sender?.profilePic || '', 150) || '/profile.png'}
            loading="lazy"
          />
        }
      </span>
    );
  }
);
ReplyPreview.displayName = "ReplyPreview";

const ActionsPanel: React.FC<{
  showMenu: boolean;
  onCopy: () => void;
  onEdit: () => void;
  onUnsend: () => void;
  hasText: boolean;
}> = React.memo(({ showMenu, onCopy, onEdit, onUnsend, hasText }) => {
  return (
    <>
      {showMenu && (
        <div
          className="flex absolute bottom-6 theme-border border rounded-sm theme-bg-secondary animate-fadeIn duration-150"
        >
          {/* EDIT BUTTON */}
          {hasText && (
            <button
              onClick={onEdit}
              className="
                flex items-center justify-center
                p-2 rounded-lg
                theme-text-primary
                hover:bg-[var(--accent-secondary)]
                transition-all duration-200
                hover:scale-105
              "
              aria-label="edit"
            >
              <TbPencil size={16} />
            </button>
          )}

          {/* COPY BUTTON */}
          <button
            onClick={onCopy}
            className="
              flex items-center justify-center
              p-2 rounded-lg
              theme-text-primary
              hover:bg-[var(--accent-secondary)]
              transition-all duration-200
              hover:scale-105
            "
            aria-label="copy"
          >
            <TbCopy size={16} />
          </button>

          {/* UNSEND BUTTON */}
          <button
            onClick={onUnsend}
            className="
              flex items-center gap-1
              px-2 py-1 rounded-lg
              theme-text-primary text-xs
              hover:text-[var(--error)]
              hover:bg-[var(--accent-secondary)]
              transition-all duration-200
              hover:scale-105
              font-semibold
            "
            aria-label="unsend"
          >
            Unsend
          </button>
        </div>

      )}
    </>
  );
});
ActionsPanel.displayName = "ActionsPanel";

const MessageBubble: React.FC<IBubble> = ({
  message,
  prevMessage,
  nextMessage,
  onMediaLoaded,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [loader, setLoader] = useState(false);
  const [messageInfo, setMessageInfo] = useState(false);
  const { user: loggedInUser } = useAppSelector((state) => state.auth)

  const isSender = message.sender?._id === loggedInUser?._id;
  const hasMedia = (message.media?.length ?? 0) > 0;
  const hasText = !!message.content?.trim();
  const sameAsPrev =
    prevMessage?.sender?._id === message?.sender?._id;

  const sameAsNext =
    nextMessage?.sender?._id === message?.sender?._id;

  const { activeRoom } = useAppSelector(state => state.chat)
  const bubbleShape = useMemo(() => {
    const isSingle = !sameAsPrev && !sameAsNext;

    // 🟢 Single message → fully rounded
    if (isSingle) {
      return "rounded-full";
    }

    // 🟢 Grouped messages
    return isSender
      ? `
        rounded-tl-2xl
        rounded-bl-2xl
        ${sameAsPrev ? "rounded-tr-sm" : "rounded-tr-2xl"}
        ${sameAsNext ? "rounded-br-sm" : "rounded-br-2xl"}
      `
      : `
        rounded-tr-2xl
        rounded-br-2xl
        ${sameAsPrev ? "rounded-tl-sm" : "rounded-tl-2xl"}
        ${sameAsNext ? "rounded-bl-sm" : "rounded-bl-2xl"}
      `;
  }, [isSender, sameAsNext, sameAsPrev]);
  const showStatus = isSender && !sameAsNext;

  const bubbleColor = isSender ? "active-theme-button theme-text-primary" : "bg-zinc-700 theme-text-primary";

  const dispatch = useDispatch();

  // handlers - memoized
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content || "");
    setShowMenu(false);
  }, [message.content]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    dispatch(setEditMessage({ messageId: message._id, currentContent: message.content || "" }));
  }, [dispatch, message._id, message.content]);

  const { unsendMessage } = useUnsendMessage(activeRoom?._id!, message._id, loggedInUser?._id!);

  const handleUnsend = useCallback(() => {
    unsendMessage();
    setShowMenu(false);
    setLoader(true);
  }, [unsendMessage]);

  const isEmojiOnly = useMemo(() => {
    try {
      return /^(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)+$/u.test(
        message.content || ""
      );
    } catch {
      return false;
    }
  }, [message.content]);

  const socket = getSocket();
  useEffect(() => {
    if (message.isDeleted) {
      setLoader(false);
    }
  }, [socket, message.isDeleted]);

  const timestamp = useTimeAgo(message.createdAt);

const handleReply = useCallback(() => {
  dispatch(
    setReplyMessage({
      messageId: message._id,
      openReply: true,
      isSender,
      // Ab hum sirf string nahi, poora object bhej rahe hain
      replyingUser: {
        _id: message.sender?._id,
        fullName: message.sender?.fullName,
        username: message.sender?.username,
        profilePic: message.sender?.profilePic,
      },
      content: message.content, 
      media: message.media || [], // Media array ko bhi pass karein
    })
  );
}, [dispatch, isSender, message]);

  // onMediaLoaded wrapper - called by MediaGrid/image on load
  const handleMediaLoadedWrapper = useCallback(() => {
    if (typeof onMediaLoaded === "function") {
      onMediaLoaded();
    }
  }, [onMediaLoaded]);

  return (
    <div
      className={`relative flex w-full ${isSender ? "justify-start flex-row-reverse" : "justify-start"} py-[1px] ${sameAsPrev ? "mt-0" : "mt-1"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowMenu(false);
      }}
    >
      {/* Avatar for receiver */}
      {!isSender && message?.content && !sameAsNext && (
        <div className="flex items-end gap-1 mr-2 animate-fadeIn">
          {!sameAsNext ? (
            <Avatar
              src={message?.sender?.profilePic}
              show={!sameAsNext}
            />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}


      <main className={`gap-1 max-w-[50%]  font-light flex flex-col justify-center ${isSender ? "items-end" : "items-start"}`}>

        {message.replyTo != null && <ReplyPreview replyTo={message.replyTo} isSender={isSender} />}


        {hasMedia && (
          <div className={`relative w-full rounded-2xl overflow-hidden`}>
            {(message?.status == "pending" && isSender) &&
              <div className="absolute top-[45%] left-0 z-[888] w-full">

                <Loader />
              </div>
            }
            <section className={`  ${(message?.status == "pending" && isSender) ? "opacity-70" : "opacity-100"}`}>

              <MediaGrid media={message.media} onMediaLoaded={handleMediaLoadedWrapper} />
            </section>
          </div>
        )}

        {/* Message content bubble */}
        <div
          key={message._id}
          onClick={() => {
            setShowActions(false);
            setMessageInfo(true);
          }}
          onMouseLeave={() => {
            setMessageInfo(false);
            setShowMenu(false);
          }}
          className={`relative  w-fit emoji-input ${message.isDeleted && 'px-5'} flex flex-col cursor-pointer ${isEmojiOnly ? "" : "shadow-sm"} overflow-hidden ${isSender ? "items-end" : "items-start animate-fadeIn"}
            ${isEmojiOnly ? "[&_img]:inline [&_img]:h-[1.2em] [&_img]:w-[1.3em]" : message?.isDeleted ? "bg-zinc-500" : bubbleColor}
            ${bubbleShape} ${hasMedia ? "" : "px-3 py-1"}`}
        >
          {/* Deleted placeholder */}
          {(message.isDeleted && message.type !== "text") && <span className="text-xs font-semibold theme-text-primary">Message unavailable</span>}

          {/* Text */}
          {hasText && (
            <span className="flex items-center gap-1 justify-start">
              {message.isEdited && <TbPencil size={15} className="theme-text-muted"/>}
              <span>
                
                <span
                  className={` ${message.isDeleted ?'text-[10px]':'text-[15px]'} ${!isSender && !message.isDeleted ? "text-zinc-100" : ""} ${isEmojiOnly && "text-[25px]"}
                    ${hasMedia ? "px-4 py-2" : ""} ${message.isDeleted ? "italic text-gray-800 text-zinc-100/50" : ""}`}
                  dangerouslySetInnerHTML={renderWithEmoji(message.content || "")}
                />
              </span>
            </span>
          )}
        </div>
        {(showStatus && !message?.isDeleted) && (
          <div className="top-1 right-0 text-[10px] theme-text-muted font-semibold">
            {message.status === "pending" && "sending…"}
            {message.status === "send" && "Send"}
            {message.status === "seen" && "seen"}
          </div>
        )}
      </main>

      {/* Right-side actions for sender */}
      {showActions && !message.isDeleted && isSender && (
        <div className="relative flex flex-col  items-end theme-text-muted justify-end mr-1 gap-2 ">
          <ActionsPanel showMenu={showMenu} onCopy={handleCopy} onEdit={handleEdit} onUnsend={handleUnsend} hasText={hasText} />

          <section className="flex items-center justify-between rounded-xl gap-2">
            <button title="Reply" className="hover:text-white  cursor-pointer rounded-full" onClick={handleReply}>
              <LiaReplySolid size={18} />
            </button>

            <button title="React" className="hover:text-white  rounded-full cursor-pointer" onClick={() => console.log("React", message._id)}>
              <Smile size={18} />
            </button>

            <button title="More" className="hover:text-white  rounded-full cursor-pointer" onClick={() => setShowMenu((p) => !p)}>
              <EllipsisVertical size={18} />
            </button>
          </section>
        </div>
      )}

      {/* Left-side actions for receiver */}
      {showActions && !isSender && (
        <section className="flex flex-col items-center justify-end w-fit ml-2">
          <div className="flex items-end justify-center gap-1 w-fit ">
            {hasText && !message?.isDeleted && (
              <button className="hover:text-white text-zinc-200 cursor-pointer hover:scale-110 rounded-full" onClick={handleCopy}>
                <TbCopy size={16} />
              </button>
            )}
            <button className="hover:text-white text-zinc-200 cursor-pointer hover:scale-110 rounded-full" onClick={handleReply}>
              <LiaReplySolid size={18} />
            </button>
            <span className="text-xs theme-text-muted p-1">{timestamp}</span>
          </div>
        </section>
      )}

      {/* Small message info (for sender) */}
      {messageInfo && !message.isDeleted && isSender && (
        <div className="w-fit h-full flex flex-col items-center justify-end ">
          <section className="text-xs px-2 w-fit h-fit flex items-center justify-center gap-1">
            <div className="border-3 rounded-full h-full theme-border" />
            {isSender && (
              <div>
                {message.status}
              </div>
            )}
            {/* <div className="text-xs">{timestamp}</div> */}
          </section>
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageBubble);

