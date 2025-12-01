// NavButton.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

interface NavButtonProps {
  icon: LucideIcon | IconType;
  label: string;
  to?: string | null | undefined;
  onClick?: (e?: any) => void | undefined;
  collapsed?: boolean;
  isActive: boolean;
  onActivate: () => void;

  unreadCount?: number; // 🔥 NEW
}

const NavButton: React.FC<NavButtonProps> = ({
  icon: Icon,
  label,
  to,
  onClick,
  collapsed,
  isActive,
  onActivate,
  unreadCount = 0, // default
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    onActivate();
    if (to) navigate(to);
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center rounded-xl font-medium relative 
        transition-all duration-200 ease-in-out select-none
        group
        ${collapsed ? "justify-center w-10 h-10" : "justify-start w-full gap-2 h-10 pl-4"}
        ${isActive ? "active-theme-button" : "theme-text-primary theme-hover-effect"}
      `}
    >
      {/* subtle hover light overlay */}
      {!isActive && (
        <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none theme-hover-light"></span>
      )}

      {/* Icon */}
      <Icon
        size={20}
        className="z-10"
        style={{ color: isActive ? "var(--bg-primary)" : "var(--text-primary)" }}
      />

      {/* Label (when not collapsed) */}
      {!collapsed && <span className="z-10 text-sm">{label}</span>}

      {/* 🔥 UNREAD BADGE */}
      {(unreadCount > 0 && label == 'Notifications')&& (
        <span
          className={`
            absolute top-0 right-0 translate-x-1 -translate-y-1
            rounded-full text-[10px] font-semibold
            px-1.5 py-[2px]
            bg-purple-500 text-white
            shadow-md z-20
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
