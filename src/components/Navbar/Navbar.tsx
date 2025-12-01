import React, { useState, useRef, useEffect, useCallback } from "react";
import NavButton from "../NavButtons/NavLinks";
import { AiOutlineLogout } from "react-icons/ai";
import { PiUserSwitch } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { TbMenu4 } from "react-icons/tb";
import { FiSidebar } from "react-icons/fi";

import {
  LayoutDashboard,
  Bell,
  Compass,
  Search,
  SquareSlash,
  Plus,
  MessageSquareText,
  Settings,
} from "lucide-react";
import SearchLayout from "../../layout/SearchLayout/SearchLayout";
import "./Navbar.css";
import { useAppSelector } from "../../store/hooks";


const Sidebar: React.FC<{
  setmenu: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setmenu }) => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null); 

  /* ─────── Click-outside: Close menu & search only if outside ─────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const outsideMenu = menuRef.current && !menuRef.current.contains(target);
      const outsideSearch = searchWrapperRef.current && !searchWrapperRef.current.contains(target);

      if (outsideMenu && outsideSearch) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearchBox]);

  /* ─────── Toggle Search (stable with useCallback) ─────── */
  const toggleSearchBox = useCallback(() => {
    setShowSearchBox((prev)=>prev ? false :true);
  }, []); // ← No dependencies

  /* ─────── Nav Items ─────── */
  const navItems = [
    { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
    { key: "Explore",   label: "Explore",   icon: Compass,      to: "/browse" },
    { key: "shorts",     label: "shorts",     icon: SquareSlash,  to: "/shorts" },
    { key: "Create",    label: "Create",    icon: Plus,         to: "/create" },
    { key: "Search",    label: "Search",    icon: Search,       onClick: {toggleSearchBox} },
    { key: "Messages",  label: "Messages",  icon: MessageSquareText, to: "/message" },
    { key: "Notifications", label: "Notifications", icon: Bell, to: "/notification" },
  ];

  const sidebarWidth = collapsed ? "4rem" : "13rem";

  const {unreadCount} = useAppSelector((state)=>state.notification)
  console.log(unreadCount);
  

  return (
    <aside
      className="relative h-full flex flex-col pt-5 rounded-xl justify-between border-r theme-border theme-text-primary shadow-md transition-all duration-300 ease-in-out"
      style={{
        width: sidebarWidth,
        backgroundColor: "var(--bg-sidebar)",
        color: "var(--text-primary)",
        overflow: "visible",
      }}
    >
      <div
        ref={searchWrapperRef}
        className={`
          absolute z-100 flex flex-col rounded-3xl overflow-hidden shadow-xl
          transition-all duration-500 ease-out
          ${showSearchBox 
            ? "opacity-100 translate-x-[8px]" 
            : "opacity-0 translate-x-full pointer-events-none"
          }
        `}
        style={{
          top: 0,
          left: "100%",
          width: "350px",
          minHeight: "700px",
          backgroundColor: "rgb(255, 255, 255, 0.08)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          padding: "1rem",
        }}
      >
        <SearchLayout />
      </div>

      {/* ─────── Top Section ─────── */}
      <div className="flex flex-col p">
        <div
          className={`flex items-center justify-center mb-8 ${
            collapsed ? "space-x-0" : "space-x-10"
          }`}
        >
          {!collapsed && (
            <h1
              onClick={() => navigate("/home")}
              className="text-2xl font-bold cursor-pointer whitespace-nowrap"
              style={{ color: "var(--accent-primary)" }}
            >
              Ocean
            </h1>
          )}

          <button
            onClick={() => setCollapsed((p) => !p)}
            className="p-3 rounded-xl transition theme-hover-effect"
            // style={{ backgroundColor: "var(--accent-secondary-hover)" }}
          >
            {<FiSidebar/>}
          </button>
        </div>

        {/* ─────── Nav Buttons ─────── */}
        <div
          className={`flex flex-col justify-center ${
            collapsed ? "items-center" : "items-start px-3"
          } gap-3`}
        >
          {navItems.map((item) => {
            const isRouteActive = item.to ? location.pathname === item.to : false;
            const isActive = activeKey === item.key || (isRouteActive && activeKey === null);

            return (
              <NavButton
                key={item.key || item.label}
                icon={item.icon}
                label={item.label}
                to={item.to}
                onClick={item.onClick?.toggleSearchBox}
                collapsed={collapsed}
                isActive={isActive}
                onActivate={() => item.key && setActiveKey(item.key)}
                unreadCount={unreadCount}
              />
            );
          })}
          
        </div>
      </div>

      {/* ─────── Bottom Menu ─────── */}
      <div
        className="relative border-t p-2"
        style={{ borderColor: "var(--border-primary)" }}
      >
        <div ref={menuRef} className="relative">
          <button
          onClick={()=>setmenu((p)=> !p)}
            // onClick={() => setMenuOpen((p) => !p)}
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-start gap-3 pl-3"
            } py-2 rounded-xl w-full transition-all`}
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent-secondary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <TbMenu4 size={20} strokeWidth={2} />
            {!collapsed && <span>Menu</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;