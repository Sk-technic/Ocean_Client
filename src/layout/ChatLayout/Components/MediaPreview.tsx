import React, { useState, useRef, useEffect } from "react";

interface MediaPreviewProps {
  files: File[];
  onRemove: (index: number) => void;
}

const MediaPreview: React.FC<MediaPreviewProps> = ({ files, onRemove }) => {
  return (
    <div className="flex gap-2">
      {files.map((file, i) => (
        <LazyMedia key={i} file={file} index={i} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface LazyMediaProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
}
const LazyMedia: React.FC<LazyMediaProps> = ({ file, index, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible && !mediaUrl) {
      const url = URL.createObjectURL(file);
      console.log("url is : ",url);
      
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [isVisible, file]);
// console.log("files",file);

  
  return (
    <div
      ref={ref}
      className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-800"
    >
      {/* Skeleton shimmer while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700" />
      )}

      {/* Lazy image or video */}
      {isVisible && (
        <>
          {isImage && (
            <img
              src={mediaUrl ?? undefined}
              alt={`preview-${index}`}
              className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
            />
          )}

          {isVideo && (
            <video
              src={mediaUrl ?? undefined}
              className={`object-cover w-full h-full rounded-lg transition-opacity duration-300 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadedData={() => setIsLoaded(true)}
              muted
              loop
              playsInline
              autoPlay
            />
          )}
        </>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        type="button"
        className="absolute top-0 right-0 bg-black/60 text-white text-xs rounded-full px-1 m-1"
      >
        ✕
      </button>
    </div>
  );
};


export default MediaPreview;
