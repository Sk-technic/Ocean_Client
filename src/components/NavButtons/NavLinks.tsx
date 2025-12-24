// NavButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

interface NavButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  to?: string | null | undefined;
  onClick?: () => void;
  collapsed?: boolean;
  isActive: boolean;
  onActivate: () => void;
  unreadCount?: number;
}

const NavButton: React.FC<NavButtonProps> = ({
  icon: Icon,
  label,
  to,
  onClick,
  collapsed = false,
  isActive,
  onActivate,
  unreadCount = 0,
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onActivate();
    if (to) navigate(to);
    onClick?.();
  };

  return (
    <button
      onClick={handleClick}
      className={`
    flex items-center rounded-xl w-full relative
    transition-all duration-300 ease-in-out p-2
    font-medium select-none group
    ${collapsed ? "justify-center" : "justify-center md:justify-start gap-3 pr-10 "}
    ${isActive
          ? "active-theme-button"
          : "theme-text-primary theme-hover-effect"}
  `}
    >

      {/* Hover overlay */}
      {!isActive && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100  transition-opacity duration-200 theme-hover-light" />
      )}

      {/* Icon */}
      <Icon
        strokeWidth={2}
        size={25}
        className="z-10 shrink-0"
        style={{
          color: isActive ? "var(--bg-primary)" : "var(--text-primary)",
        }}
      />

      <span
        className={`
    z-10 whitespace-nowrap hidden md:flex overflow-hidden
    transition-all duration-500 text-sm ease-in-out
    ${collapsed
            ? "max-w-0 opacity-0 ml-0"
            : "opacity-100 ml-1"}
  `}
      >
        {label}
      </span>

      {/* 🔥 Unread badge */}
      {unreadCount > 0 && label === "Notifications" && (
        <span
          className={`
            absolute top-0 right-0 translate-x-1 -translate-y-1
            rounded-full text-[10px] font-semibold
            px-1.5 py-[2px]
            bg-purple-500 text-white shadow-md z-20
            transition-all duration-300
            ${collapsed ? "text-[9px] px-1 py-[1px]" : ""}
          `}
        >
          {unreadCount > 50 ? "50+" : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NavButton;
