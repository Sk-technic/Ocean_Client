import React from "react";
import { Settings, Bookmark, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IoSunnyOutline } from "react-icons/io5";
import { useLogout } from "../../hooks/auth/authHooks";
import { useTheme } from "../../hooks/theme/usetheme";
import { BsMoon } from "react-icons/bs";

const MenuItem = ({
  icon: Icon,
  label,
  onClick
}: {
  icon: any;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="
      w-full flex items-center overflow-hidden gap-3 px-3 py-3 text-sm
      theme-text-primary hover:bg-[var(--accent-secondary)] 
      rounded-xl transition 
    "
  >
  

    <Icon size={18} className="theme-text-primary animate-fadeIn" />
    {label}
 

  </button>
);

const AccountMenu: React.FC<{onSetMenu:(value:boolean)=>void}> = ({onSetMenu}) => {

  const Navigate = useNavigate()
  const { mutate: logout } = useLogout()

  
  const { theme, setTheme } = useTheme(); // ✅ FIXED
  const changeTheme = (currentTheme: string) => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setTheme(newTheme); // Dispatches redux correctly
  };


  return (
    <main
      className="
        absolute left-5 bottom-20
        w-60 rounded-2xl overflow-hidden
        theme-bg-card theme-border border
        shadow-md  backdrop-blur-lg z-50
        animate-fadeIn
      "
    >

      {/* TOP ITEMS */}
      <div className="p-2 space-y-1">
        <MenuItem icon={Settings} label="Settings" onClick={() => {Navigate('/settings'); onSetMenu(false) }} />
        <MenuItem icon={MessageCircle} label="Your activity" />
        <MenuItem icon={Bookmark} label="Saved"/>
        <MenuItem icon={theme=="dark"?BsMoon:IoSunnyOutline} label="Switch appearance" onClick={()=>changeTheme(theme)}/>
        <MenuItem icon={MessageCircle} label="Report a problem" />
      </div>

      {/* SEPARATOR */}
      <div className="w-full h-[1px] bg-[var(--border-primary)] my-1"></div>

      {/* SWITCH ACCOUNTS */}
      <div className="p-2 space-y-1">

        <button
          className="
          w-full text-left px-4 py-3 text-sm rounded-xl
          theme-text-primary hover:bg-[var(--accent-secondary)]
          transition
        "
        >
          Switch accounts
        </button>

        {/* LOGOUT */}
        <button
          className="
          w-full text-left px-4 py-3 text-sm rounded-xl
          theme-text-primary hover:bg-[var(--accent-secondary)]
          transition rounded-b-xl
        "
          onClick={() => {logout(); onSetMenu(false)}}
        >
          Log out
        </button>
      </div>
    </main>
  );
};

export default AccountMenu;
