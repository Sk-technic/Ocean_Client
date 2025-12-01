import React, { useState, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import type { IMedia } from "../../../types/chat";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { FaCirclePlay } from "react-icons/fa6";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { optimizeUrl } from "../../../utils/imageOptimize";

interface MediaGridProps {
  media?: IMedia[] | null;
  onMediaLoaded?: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({ media, onMediaLoaded }) => {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const openViewer = (i: number) => setCurrentIndex(i);
  const closeViewer = () => setCurrentIndex(null);

  const showNext = useCallback(() => {
    if (currentIndex === null) return;
    setCurrentIndex((prev) => (prev! + 1) % media.length);
  }, [currentIndex, media.length]);

  const showPrev = useCallback(() => {
    if (currentIndex === null) return;
    setCurrentIndex((prev) => (prev! - 1 + media.length) % media.length);
  }, [currentIndex, media.length]);

  /** Blur tiny preview */
  const blurUrl = (url: string) =>
    url.replace("/upload/", "/upload/w_20,e_blur:1500/");
  /** Fullscreen viewer */
  const viewer =
    currentIndex !== null &&
    ReactDOM.createPortal(
      <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999] backdrop-blur-sm">

        {/* Close */}
        <button
          onClick={closeViewer}
          className="absolute top-5 right-5 text-white p-2 hover:bg-white/20 rounded-full z-10"
        >
          <X size={24} />
        </button>

        {/* Prev */}
        {media.length > 1 && (
          <button
            onClick={showPrev}
            className="absolute left-5 text-white p-3 hover:bg-white/10 rounded-full z-10"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        {/* MAIN Viewer */}
        <div className="flex items-center justify-center w-full h-full">
          {media[currentIndex].type?.startsWith("image") ? (
            <img
              src={media[currentIndex].url}
              className="max-w-[100vw] max-h-[100vh] object-contain"
            />
          ) : (
            <video
              src={media[currentIndex].url}
              className="max-w-[100vw] max-h-[100vh] object-contain"
              autoPlay
              controls
              loop
              muted
            />
          )}
        </div>

        {/* Next */}
        {media.length > 1 && (
          <button
            onClick={showNext}
            className="absolute right-5 text-white p-3 hover:bg-white/10 rounded-full z-10"
          >
            <ChevronRight size={36} />
          </button>
        )}
      </div>,
      document.body
    );

  /** Smart Layout calculation */
  const bigIndex =
    media.findIndex((m) => m.type?.startsWith("video")) !== -1
      ? media.findIndex((m) => m.type?.startsWith("video"))
      : 0;

  const bigItem = media[bigIndex];
  const smallItems = media.filter((_, i) => i !== bigIndex).slice(0, 3);

  /** Thumbnail Renderer */
  const renderThumb = useCallback((
    file: IMedia,
    i: number,
    className: string,
    forceIndex?: number
  ) => {
    const idx = forceIndex !== undefined ? forceIndex : i;

    return (
      <div
        key={file._id ?? i}
        onClick={() => openViewer(idx)}
        className={`relative rounded-xl overflow-hidden cursor-pointer bg-black/20 ${className}`}
        style={{ width: "200px"}}
      >
        <LazyLoadImage
          src={optimizeUrl(file.thumbnail || file.url ||'',500)}
          placeholderSrc={blurUrl(file.thumbnail || file.url || "")}
          effect="opacity"
          loading="lazy"
          onLoad={() => onMediaLoaded?.()}
          decoding="async"
              threshold={400}

          className="w-full h-full object-cover block"   // <-- IMPORTANT
          wrapperClassName="w-full h-full"              // <-- IMPORTANT
        />

        {/* Video play icon */}
        {file.type?.startsWith("video") && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <FaCirclePlay size={40} className="text-white" />
          </div>
        )}
      </div>
    );
  }, [])

  /* -------------------------
     CASE 1: ONLY ONE MEDIA
     ------------------------- */
  if (media.length === 1) {
    const m = media[0];

    return (
      <div style={{ width: "200px" }}>
        {renderThumb(
          m,
          0,
          m.type?.startsWith("video") ? "aspect-[9/16]" : "aspect-square"
        )}
        {viewer}
      </div>
    );
  }

  /* -------------------------
     CASE 2: TWO MEDIA
     ------------------------- */
  if (media.length === 2) {
    return (
      <div className="flex gap-1" style={{ width: "402px" }}>
        {media.map((m, i) => renderThumb(m, i, "aspect-square"))}
        {viewer}
      </div>
    );
  }

  /* -------------------------
     CASE 3 or 4: INSTAGRAM STYLE
     ------------------------- */

  return (
    <>
      <div
        className="grid grid-cols-[200px_200px] gap-1"
        style={{ width: "402px" }}
      >
        {/* BIG TILE (VIDEO gets priority) */}
        <div className="row-span-2 h-[400px]">
          {renderThumb(
            bigItem,
            bigIndex,
            bigItem.type?.startsWith("video")
              ? "h-full aspect-[9/16]"
              : "h-full aspect-square",
            bigIndex
          )}
        </div>

        {/* SMALL ITEMS */}
        <div className="flex flex-col gap-1 h-[400px]">
          {smallItems.map((m, i) =>
            renderThumb(
              m,
              i,
              "flex-1 w-full",
              media.indexOf(m) // correct viewer index
            )
          )}
        </div>
      </div>

      {viewer}
    </>
  );
};

export default React.memo(MediaGrid);
