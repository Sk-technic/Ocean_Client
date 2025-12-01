import React, { type ReactElement } from "react";
import { useState } from "react";
import Input from "./Input";
import { toast } from "react-toastify";
import { RxCross1 } from "react-icons/rx";
import {
  FaInstagram,
  FaFacebook,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaTelegram,
} from "react-icons/fa";

import { SiThreads } from "react-icons/si";
import { FiClipboard } from "react-icons/fi";

interface SocialLinksInputProps {
  value: Record<string, string>;
  onChange: (updated: Record<string, string>) => void;
}

const platforms: string[] = [
  "instagram",
  "facebook",
  "discord",
  "twitter",
  "youtube",
  "threads",
  "telegram",
];

// Base URLs for platforms
const baseUrls: Record<string, string> = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  discord: "https://discord.com/users/",
  twitter: "https://twitter.com/",
  youtube: "https://youtube.com/",
  threads: "https://threads.net/",
  telegram: "https://t.me/",
};

// React icons for platforms
const platformIcons: Record<string, ReactElement> = {
  instagram: <FaInstagram className="w-5 h-5 text-pink-500" />,
  facebook: <FaFacebook className="w-5 h-5 text-blue-600" />,
  discord: <FaDiscord className="w-5 h-5 text-indigo-500" />,
  twitter: <FaTwitter className="w-5 h-5 text-blue-400" />,
  youtube: <FaYoutube className="w-5 h-5 text-red-600" />,
  threads: <SiThreads className="w-5 h-5 text-gray-800" />,
  telegram: <FaTelegram className="w-5 h-5 text-blue-500" />,
};

const SocialLinksInput: React.FC<SocialLinksInputProps> = ({ value, onChange }) => {
  const [currentKey, setCurrentKey] = useState<string>(platforms[0]);
  const [currentUsername, setCurrentUsername] = useState<string>("");

  const handleAdd = () => {
    const username: string = currentUsername.trim();
    if (!username) return toast.error("Enter a valid username");

    const fullUrl: string = `${baseUrls[currentKey]}${username}`;
    onChange({ ...value, [currentKey]: fullUrl });
    setCurrentUsername("");
  };

  const handleDelete = (key: string) => {
    const updated: Record<string, string> = { ...value };
    delete updated[key];
    onChange(updated);
  };

  const handleCopy = (link: string, key: string) => {
    navigator.clipboard.writeText(link);
    toast.success(`${key} link copied!`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Add new social link */}
      <div className="flex gap-2">
        <select
          className="rounded-md px-2 py-2 w-32 bg-[var(--bg-card)] text-[var(--text-primary)]"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
        >
          {platforms.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <Input
          name="social-username"
          placeholder={`Enter ${currentKey} username`}
          value={currentUsername}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCurrentUsername(e.target.value)
          }
          className="flex-1"
        />

        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 rounded-md bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition"
        >
          Add
        </button>
      </div>

      {/* Display added social links */}
      <div className="flex gap-3 w-full p-2 overflow-x-auto">
        {Object.entries(value).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--accent-secondary-hover)] transition-colors shadow-sm flex-shrink-0"
          >
            {/* Platform Icon */}
            {platformIcons[key] || (
              <span className="w-5 h-5 font-bold uppercase text-xs flex items-center justify-center">
                {key.charAt(0)}
              </span>
            )}

            {/* Link text */}
            <span className="text-sm text-[var(--text-primary)] truncate max-w-xs">
              {val.replace(/^https?:\/\/(www\.)?/, "")}
            </span>

            {/* Copy to clipboard */}
            <button
              type="button"
              onClick={() => handleCopy(val, key)}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <FiClipboard className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(key)}
              className="text-red-500 hover:text-red-600 flex-shrink-0"
            >
              <RxCross1 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksInput;
