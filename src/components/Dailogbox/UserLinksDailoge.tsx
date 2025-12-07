import React, { type ReactElement } from "react";
import { RxCopy, RxCross2 } from "react-icons/rx";
import { FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/theme/usetheme";
import {
  FaInstagram,
  FaFacebook,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaTelegram,
} from "react-icons/fa";
import { SiThreads } from "react-icons/si";
import { TbArrowsCross, TbCross } from "react-icons/tb";

interface UserLinksDialogProps {
  open: boolean;
  onClose: () => void;
  socialLinks: Record<string, string>;
}

const platformIcons: Record<string, ReactElement> = {
  instagram: <span className="theme-text-primary"><FaInstagram/></span>,
  facebook: <span className="theme-text-primary"><FaFacebook/></span>,
  discord: <span className="theme-text-primary"><FaDiscord/></span>,
  twitter: <span className="theme-text-primary"><FaTwitter/></span>,
  youtube: <span className="theme-text-primary"><FaYoutube/></span>,
  threads: <span className="theme-text-primary"><SiThreads/></span>,
  telegram: <span className="theme-text-primary"><FaTelegram/></span>,
};

const UserLinksDialog: React.FC<UserLinksDialogProps> = ({
  open,
  onClose,
  socialLinks,
}) => {
  const { theme } = useTheme();

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied!");
  };

  return (
    <div
      className={` fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Blurred background */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Dialog content */}
      <div
        className={`relative w-[90%] max-w-md theme-border bg-zinc-100/40 backdrop-blur-xl border p-2 rounded-2xl shadow-lg transform transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-90 opacity-0"
        } ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute theme-bg-primary rounded-full p-[1px] hover:cursor-pointer -top-3 -right-3"
        >
          <RxCross2 size={13} color="theme-text-primary"/>
        </button>
        <h2 className="text-sm font-semibold mb-1 theme-text-primary">Social Links</h2>

        <div className="flex flex-col gap-3 max-h-96 shadow-lg overflow-y-auto">
          {Object.entries(socialLinks).map(([key, url]) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 rounded-lg theme-bg-primary theme-border border theme-hover-effect  transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center">
                  {platformIcons[key] || "🔗"}
                </span>
                <span className="theme-text-muted text-xs truncate max-w-xs">
                  {url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(url)}
                >
                  <RxCopy className="theme-text-primary"/>
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-primary)] transition"
                  title="Open link"
                >
                  <FiExternalLink color="blue"/>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default UserLinksDialog;
