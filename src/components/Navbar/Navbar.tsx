import React, { useState, useRef, } from "react";
import NavButton from "../NavButtons/NavLinks";
import { TbMenu4 } from "react-icons/tb";

import {
  LayoutDashboard,
  Bell,
  Compass,
  Search,
  SquareSlash,
  Plus,
  MessageSquareText,
} from "lucide-react";
import SearchLayout from "../../layout/SearchLayout/SearchLayout";
import "./Navbar.css";
import { useAppSelector } from "../../store/hooks";
import NotificationPage from "../../pages/Notification/Notification";
import { useTheme } from "../../hooks/theme/usetheme";
import { useReadAllNotification } from "../../hooks/notifications/notifications";


const Sidebar: React.FC<{
  setmenu: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ setmenu }) => {
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [notificationbox, setShowNotification] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);
  const NotificationWrapperRef = useRef<HTMLDivElement | null>(null);
  
  const { unreadCount } = useAppSelector((state) => state.notification)
  const { user:loggedInUser } = useAppSelector((state) => state.auth)
  const {mutateAsync:readAllNotifications} = useReadAllNotification()

const handlecontrol = (label:string) => {
  if(label==="Search"){
    setShowNotification(false)
    setShowSearchBox((prev)=>!prev)
    setCollapsed(true)
  }
  if(label==="Notifications"){
    setShowSearchBox(false)
    if(unreadCount){
      readAllNotifications(loggedInUser?._id!)
    }
    setShowNotification((prev)=>!prev)
    setCollapsed(true)
  }
  if(label!=="Search" && label!=="Notifications"){  
    setCollapsed(false)
    setShowSearchBox(false)
    setShowNotification(false)
  }
  if(label=="Messages"){
    setCollapsed(true)
  }
}
  /* ─────── Nav Items ─────── */
  const navItems = [
    { key: "Explore", label: "Explore", icon: Compass, to: "/browse" },
    { key: "shorts", label: "shorts", icon: SquareSlash, to: "/shorts" },
    { key: "Search", label: "Search", icon: Search, },
    { key: "Create", label: "Create", icon: Plus, to: "/create" },
    { key: "Messages", label: "Messages", icon: MessageSquareText, to: "/message" },
    { key: "Notifications", label: "Notifications", icon: Bell },
    { key: "Dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  ];

  const {theme} = useTheme()
  return (
    <aside
      className={`relative z-[999] h-fit md:h-full ${collapsed && 'md:px-2'} flex md:flex-col md:justify-between border-r-2 theme-border theme-text-primary transition-all duration-300 ease-in-out`}
    >

              {/* ─────── slides ─────── */}

      <div
        ref={searchWrapperRef}
        className={`
          absolute flex flex-col overflow-hidden
          transition-all duration-300 ease-out
          ${showSearchBox
            ? "opacity-100 border-r-5 theme-border translate-x-[0px]"
            : "opacity-0 -translate-x-30 pointer-events-none"
          }
        `}
        style={{
          top: 0,
          left: "100%",
          height: "100%",
          zIndex: 50
        }}

      >
        <SearchLayout />
      </div>

      <div
        ref={NotificationWrapperRef}
        className={`
          absolute flex flex-col overflow-hidden  shadow-md
          transition-all duration-300 ease-out
          ${notificationbox
            ? "opacity-100 translate-x-[0px]"
            : "opacity-0 -translate-x-30 pointer-events-none"
          }
        `}
        style={{
          top: 0,
          left: "100%",
          height: "100%",
          zIndex: 20
        }}
      >
        <NotificationPage />
      </div>

      <div className="flex flex-col gap-10 z-[9999] w-full">

        <div className={`flex items-center p-3 mt-5 hidden md:flex ${collapsed ? "justify-center":""}`}>
          {
            collapsed?
            <img src={`/Ocean_logo.png`} alt="ocean" className=" h-8 pointer-events-none"/>
            :
            <img src={`${theme=="dark"? '/w_lable.png':'b_lable.png'}`} alt="ocean" className=" h-8 pointer-events-none"/>
          }
        </div>
        {/* ─────── Nav Buttons ─────── */}
        <div
          className={`flex md:flex-col justify-center gap-3 p-3 `}
        >
          {navItems.map((item,index) => {
            const isRouteActive = item.to ? location.pathname === item.to : false;
            const isActive = activeKey === item.key || (isRouteActive && activeKey === null);

            return (
              <div key={index} className="w-full" onClick={()=>handlecontrol(item.label)}>

              <NavButton
                key={item.key || item.label}
                icon={item.icon}
                label={item.label}
                to={item.to}
                collapsed={collapsed}
                isActive={isActive}
                onActivate={() => item.key && setActiveKey(item.key)}
                unreadCount={unreadCount}
                />
                </div>
            );
          })}

        </div>
      </div>

      {/* ─────── Bottom Menu ─────── */}
      <div
        className="relative p-2 hidden md:flex  items-center"
      >
        <div ref={menuRef} className="relative theme-text-primary w-full">
          <button
            onClick={() => setmenu((p) => !p)}
            className={`flex items-center ${collapsed?"justify-center p-2":"p-2 gap-3"} rounded-xl w-full transition-all`}
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--accent-secondary-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <TbMenu4 size={25} strokeWidth={2} />
            {!collapsed && <span className="text-sm hidden md:flex">Menu</span>}
          </button>
        </div>
      </div>
    </aside >
  );
};

export default Sidebar;