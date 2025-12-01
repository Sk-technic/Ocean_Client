import React, { type ReactElement } from "react";
import { RxCopy } from "react-icons/rx";
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

interface UserLinksDialogProps {
  open: boolean;
  onClose: () => void;
  socialLinks: Record<string, string>;
}

const platformIcons: Record<string, ReactElement> = {
  instagram: <span className="text-pink-500"><FaInstagram/></span>,
  facebook: <span className="text-blue-600"><FaFacebook/></span>,
  discord: <span className="text-indigo-500"><FaDiscord/></span>,
  twitter: <span className="text-sky-400"><FaTwitter/></span>,
  youtube: <span className="text-red-600"><FaYoutube/></span>,
  threads: <span className="text-zinc-600"><SiThreads/></span>,
  telegram: <span className="text-blue-400"><FaTelegram/></span>,
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
      className={`fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      {/* Blurred background */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Dialog content */}
      <div
        className={`relative w-[90%] max-w-md bg-[var(--bg-card)] p-5 rounded-2xl shadow-lg transform transition-all duration-300 ${
          open ? "scale-100 opacity-100" : "scale-90 opacity-0"
        } ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Social Links</h2>

        <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
          {Object.entries(socialLinks).map(([key, url]) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary-hover)] transition"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center">
                  {platformIcons[key] || "🔗"}
                </span>
                <span className="truncate max-w-xs">
                  {url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopy(url)}
                  className="hover:text-[var(--accent-primary)] transition"
                  title="Copy link"
                >
                  <RxCopy />
                </button>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--accent-primary)] transition"
                  title="Open link"
                >
                  <FiExternalLink />
                </a>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--accent-primary)] hover:opacity-80"
        >
          ✖
        </button>
      </div>
    </div>
  );
};

export default UserLinksDialog;
