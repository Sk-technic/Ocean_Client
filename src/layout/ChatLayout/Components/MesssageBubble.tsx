import React, { lazy, useEffect, useState, useMemo, useCallback, useRef, type HtmlHTMLAttributes } from "react";
import type { Message } from "../../../types/chat";
import type { User } from "../../../types";
import { EllipsisVertical, Smile } from "lucide-react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { renderWithEmoji } from "../../../utils/emojiRender";
import { useUnsendMessage } from "../../../hooks/chat/chatEvents";
import { getSocket } from "../../../api/config/socketClient";
import ProcessLoader from "../../../components/Loader/ProcessLoader";
import { TbCopy } from "react-icons/tb";
import { FiEdit2 } from "react-icons/fi";
import { LiaReplySolid } from "react-icons/lia";
import { useTimeAgo } from "../../../utils/timecoverter";
import { HiMiniArrowPath } from "react-icons/hi2";
import { useDispatch } from "react-redux";
import { setEditMessage } from "../../../store/slices/messages/editMessage";
import { setReplyMessage } from "../../../store/slices/messages/replyMessage";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { useAppSelector } from "../../../store/hooks";
import MediaGrid from "./MediaGrid";

interface IBubble {
  message: Message;
  prevMessage?: Message;
  nextMessage?: Message;
  onMediaLoaded?: () => void;
}

/**
 * Performance notes:
 * - Avoid inline style contain/lots of nested wrappers.
 * - Provide width/height on images to reduce layout shift.
 * - Memoize subcomponents to avoid re-renders during virtualization.
 * - Use will-change only on the interactive media element.
 */

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
        className={`text-xs bg-transparent w-20 h-fit w-full flex ${isSender ? "flex-row-reverse" : ""} items-start justify-start gap-1`}
      >
        {!isMediaReply && <div className="border-3 rounded-full theme-border h-full" />}
        <span>
          <LiaReplySolid size={20} />
        </span>
        <span className={`w-fit ${isMediaReply ? "" : "bg-zinc-500/50 rounded-2xl px-2"} backdrop-blur-lg`}>
          {!isMediaReply && <div className="p-2">{replyTo?.content}</div>}
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
          className="
            absolute bottom-10
            flex items-center theme-bg-secondary shadow-sm justify-between gap-1
            px-2 py-1
            backdrop-blur-md
            theme-bg-secondary/50 
            rounded-xl
            theme-border border
          "
        >
          {/* Left small indicator */}
          <div className="w-2 h-2 rounded-full theme-bg-primary" />

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
              <FiEdit2 size={16} />
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

  const isSender = message?.sender?._id === loggedInUser?._id;
  const hasMedia = (message.media?.length ?? 0) > 0;
  const hasText = !!message.content?.trim();
  const sameAsPrev = prevMessage && prevMessage.sender._id === message.sender._id;
  const sameAsNext = nextMessage && nextMessage.sender._id === message.sender._id;

  const bubbleShape = useMemo(() => {
    return isSender
      ? `${sameAsNext ? "rounded-br-sm" : "rounded-br-xl"} ${sameAsPrev ? "rounded-tr-sm" : "rounded-tr-xl"} rounded-tl-xl rounded-bl-xl`
      : `${sameAsNext ? "rounded-bl-sm" : "rounded-bl-xl"} ${sameAsPrev ? "rounded-tl-sm" : "rounded-tl-xl"} rounded-tr-xl rounded-br-xl`;
  }, [isSender, sameAsNext, sameAsPrev]);

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

  const { unsendMessage } = useUnsendMessage(message.roomId, message._id, loggedInUser?._id!);

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
        replyingUser: message?.sender?.fullName,
        content: message.content ? message.content : "media",
      })
    );
  }, [dispatch, isSender, message._id, message.content, message?.sender?.fullName]);

  // onMediaLoaded wrapper - called by MediaGrid/image on load
  const handleMediaLoadedWrapper = useCallback(() => {
    if (typeof onMediaLoaded === "function") {
      onMediaLoaded();
    }
  }, [onMediaLoaded]);

  return (
    <div
      className={`relative flex w-full ${isSender ? "justify-start flex-row-reverse" : "justify-start"} px-2 mb-1 ${sameAsPrev ? "mt-[1px]" : "mt-3"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowMenu(false);
      }}
    >
      {/* Avatar for receiver */}
      {!isSender && (
        <div className="flex items-end gap-1 mr-2">
          {!sameAsNext ? <Avatar src={message?.sender?.profilePic} show={!sameAsNext} /> : <div className="w-8" />}
        </div>
      )}

      <main className={`gap-1 max-w-[50%] flex flex-col justify-center ${isSender ? "items-end" : "items-start"}`}>

        {message.replyTo != null && <ReplyPreview replyTo={message.replyTo} isSender={isSender} />}


        {hasMedia && (
          <div className={`relative w-full rounded-2xl overflow-hidden ${loader ? "opacity-80" : "opacity-100"}`}>

            {(loader && hasMedia) && <div className="z-80 w-full h-full absolute opacity-100 bg-zinc-500/30 backdrop-blur-xs top-0 left-0 flex items-center justify-center">
              <ProcessLoader size={50} color="var(--accent-primary)" thickness="3px" />
            </div>}


            <MediaGrid media={message.media} onMediaLoaded={handleMediaLoadedWrapper} />
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
          className={`relative w-fit emoji-input flex flex-col hover:cursor-pointer ${isEmojiOnly ? "" : "shadow-sm"} overflow-hidden ${isSender ? "items-end" : "items-start"}
            ${isEmojiOnly ? "[&_img]:inline [&_img]:h-[1.2em] [&_img]:w-[1.3em]" : message?.isDeleted ? "bg-zinc-100/40" : bubbleColor}
            ${bubbleShape} ${hasMedia ? "" : "px-2 py-2"} relative`}
        >
          {/* Deleted placeholder */}
          {message.isDeleted && message?.content === "This message was removed or is no longer accessible." ? (
            <div className="w-full flex items-center justify-start">
              <span className="text-sm text-zinc-200">Message unavailable</span>
            </div>
          ) : null}

          {/* Text */}
          {hasText && (
            <div className="flex items-center gap-1 justify-start">
              {message.isEdited && <HiMiniArrowPath size={15} />}
              <section>
                <span
                  className={`text-[12px] ${!isSender && !message.isDeleted ? "text-zinc-100" : ""} ${isEmojiOnly && !message?.isDeleted ? "text-[30px]" : !message.isDeleted ? "text-[16px]" : ""
                    } whitespace-pre-line leading-snug ${hasMedia ? "px-4 py-1" : ""} ${message.isDeleted ? "italic text-gray-800 text-zinc-100/50" : ""}`}
                  // renderWithEmoji output may be large; keep content in its own span
                  dangerouslySetInnerHTML={renderWithEmoji(message.content || "")}
                />
              </section>
            </div>
          )}
        </div>
      </main>

      {/* Right-side actions for sender */}
      {showActions && !message.isDeleted && isSender && (
        <div className="relative flex flex-col text-gray-300 items-end justify-end mr-1 gap-2 ">
          <ActionsPanel showMenu={showMenu} onCopy={handleCopy} onEdit={handleEdit} onUnsend={handleUnsend} hasText={hasText} />

          <section className="flex items-center justify-between theme-bg-secondary backdrop-blur-md border theme-border p-1 rounded-xl gap-2">
            <button title="Reply" className="hover:text-white py-1 hover:cursor-pointer rounded-full" onClick={handleReply}>
              <LiaReplySolid size={18} />
            </button>

            <button title="React" className="hover:text-white py-1 rounded-full hover:cursor-pointer" onClick={() => console.log("React", message._id)}>
              <Smile size={18} />
            </button>

            <button title="More" className="hover:text-white py-1 rounded-full hover:cursor-pointer" onClick={() => setShowMenu((p) => !p)}>
              <EllipsisVertical size={18} />
            </button>
            {(isSender) && <span>
              {message.status}
            </span>}
          </section>
        </div>
      )}

      {/* Left-side actions for receiver */}
      {showActions && !isSender && (
        <section className="flex flex-col items-center justify-end w-fit ml-2">
          <div className="flex items-end justify-center gap-1 w-fit theme-bg-secondary rounded-xl backdrop-blur-sm border p-1 theme-border">
            {hasText && !message?.isDeleted && (
              <button className="hover:text-white text-zinc-200 hover:cursor-pointer hover:scale-110 p-1 rounded-full" onClick={handleCopy}>
                <TbCopy size={16} />
              </button>
            )}
            <button className="hover:text-white text-zinc-200 hover:cursor-pointer hover:scale-110 p-1 rounded-full" onClick={handleReply}>
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
              <div className={`text-xs ${message.status === "seen" ? "text-lime-600" : "text-zinc-500"} ${message.status === "failed" ? "text-red-700" : ""}`}>
                {message.status}
              </div>
            )}
            <div className="text-xs">{timestamp}</div>
          </section>
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageBubble);

