import React, { type ReactElement } from "react";
import { useState } from "react";
import Input from "./Input";
import { toast } from "react-hot-toast";
import { RxCross1 } from "react-icons/rx";
import {
  FaInstagram,
  FaFacebook,
  FaDiscord,
  FaTwitter,
  FaYoutube,
  FaTelegram,
} from "react-icons/fa";
import { TbCopy } from "react-icons/tb";

import { SiThreads } from "react-icons/si";

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
  instagram: <FaInstagram size={13} className="text-zinc-400" />,
  facebook: <FaFacebook size={13} className="text-zinc-400" />,
  discord: <FaDiscord size={13} className="text-zinc-400" />,
  twitter: <FaTwitter size={13} className="text-zinc-400" />,
  youtube: <FaYoutube size={13} className="text-zinc-400" />,
  threads: <SiThreads size={13} className="text-zinc-400" />,
  telegram: <FaTelegram size={13} className="text-zinc-400" />,
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
      <div className="flex gap-2 items-end justify-center">
        <select
          className=" py-2 rounded-sm px-1 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs"
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
          className="border theme-border bg-gradient-to-r from-blue-500/60 to-sky-500/50 p-1 rounded-md "
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
            <span className="text-[10px] text-[var(--text-primary)] truncate max-w-xs">
              {val.replace(/^https?:\/\/(www\.)?/, "")}
            </span>

            {/* Copy to clipboard */}
            <button
              type="button"
              onClick={() => handleCopy(val, key)}
              className="text-gray-500 hover:text-gray-700 flex-shrink-0"
            >
              <TbCopy size={15}/>
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDelete(key)}
            >
              <RxCross1 size={10}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialLinksInput;
