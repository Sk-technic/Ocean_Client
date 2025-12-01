import React from "react";
import { useTheme } from "../../hooks/theme/usetheme";

export interface VideoItem {
  id: string;
  thumbnail: string;
  title: string;
  channel: string;
  views: string;
  duration?: string;
}

interface ContentSectionProps {
  videos: VideoItem[];
}

const ContentSection: React.FC<ContentSectionProps> = ({ videos }) => {
  const { theme } = useTheme();

  return (
    <div className="p-4 flex flex-col gap-6">
      {/* Grid container */}
      <div
        className={`grid gap-6 ${
          videos.length > 3
            ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        }`}
      >
        {videos.map((video) => (
          <div
            key={video.id}
            className={`
              flex flex-col cursor-pointer rounded-lg overflow-hidden shadow-md 
              ${theme === "dark" ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"} 
              transition-colors duration-200
            `}
          >
            {/* Thumbnail */}
            <div className="relative w-full aspect-video bg-gray-300">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="object-cover w-full h-full"
              />
              {video.duration && (
                <span
                  className="absolute bottom-2 right-2 text-xs font-semibold px-1 py-[1px] rounded-sm 
                             bg-black text-white bg-opacity-80"
                >
                  {video.duration}
                </span>
              )}
            </div>

            {/* Video Info */}
            <div className="p-2 flex flex-col gap-1">
              <h3
                className={`text-sm font-medium line-clamp-2 ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {video.title}
              </h3>
              <p
                className={`text-xs text-gray-400 truncate ${
                  theme === "dark" ? "text-gray-300" : "text-gray-500"
                }`}
              >
                {video.channel} • {video.views} views
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentSection;
