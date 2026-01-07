import React, { useState } from "react";
import { RiVideoLine, RiClapperboardLine } from "react-icons/ri";
import { useTheme } from "../../hooks/theme/usetheme";
import { DollarSign, ChartNoAxesCombined,Clapperboard, Captions, ListMusic, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { GrGroup } from "react-icons/gr";

interface ProfileNavBarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

const ProfileVerticalNav: React.FC<ProfileNavBarProps> = ({
  activeTab = "Profile",
  onTabChange,
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const { theme } = useTheme();

  const tabs = [
    { link: "/dashboard", key: "Profile", label: "Profile", icon: <UserRound size={20} /> },
    { link: "content", key: "Content", label: "Content", icon: <Clapperboard size={20} /> },
    { link: "Community", key: "Community", label: "Community", icon: <GrGroup size={20} /> },
    { link: "Videos", key: "Videos", label: "Videos", icon: <RiClapperboardLine size={20} /> },
    { link: "Analytics", key: "Analytics", label: "Analytics", icon: <ChartNoAxesCombined size={20} /> },
    { link: "Earn", key: "Earn", label: "Earn", icon: <DollarSign size={20} /> },
    { link: "Lites", key: "Lites", label: "Lites", icon: <RiVideoLine size={20} /> },
    { link: "Subtitle", key: "Subtitle", label: "Subtitle", icon: <Captions size={20} /> },
    { link: "Audio-library", key: "Audio library", label: "Audio library", icon: <ListMusic size={20} /> },


  ];



  return (
    <main className="bg-gradient-to-b from-violet-300 to-rose-300 rounded-xl p-[1px]">

    <div
      className={`flex flex-col  w-60 py-2   shadow-lg 
        border border-[var(--border-primary)] rounded-xl
        theme-bg-primary transition-all duration-300 overflow-hidden`}
    >
      <div className="w-full border-b border-[var(--border-primary)] h-50 flex flex-col items-center gap-2 justify-center
          
          bg-transparent/20 p-4">
        <section className="w-fit h-fit bg-gray-300 p-[3px] rounded-full  flex justify-center items-center">
          <div className="w-25  h-25 rounded-full flex justify-center items-center overflow-hidden">
            <img src="https://placehold.co/150x150" alt="" className=" w-32 h-32 object-contain rounded-full" />
          </div>
        </section>
        <section className="w-full flex flex-col justify-center items-center">
          <h1 className="text-md font-normal">channel_Name</h1>
          <h1 className="text-[13px] font-bold">User_Name</h1>
        </section>
         <section className="w-full flex  justify-start items-center">
          <p className="text-xs font-thin">example@gmail.com</p>
        </section>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2 h-full 
        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tabs.map((tab) => (
          <Link
            to={tab.link}
            onClick={() => {
              setCurrentTab(tab.key);      // update local state
              onTabChange?.(tab.key);      // optional callback to parent
            }}
            key={tab.key}
            className={`relative w-full flex items-center px-4 py-2.5 mx-2 rounded-lg
              transition-all duration-200 ease-in-out group
              ${currentTab === tab.key
                ? theme === "dark"
                  ? "bg-[var(--accent-secondary)] text-white shadow-sm"
                  : "bg-[var(--accent-secondary)] text-[var(--text-primary)] shadow-sm"
                : theme === "dark"
                  ? "text-[var(--text-secondary)] hover:bg-[var(--accent-secondary-hover)] hover:text-white"
                  : "text-[var(--text-secondary)] hover:bg-[var(--accent-secondary-hover)] hover:text-[var(--text-primary)]"
              }
            `}
          >
            {/* Icon */}
            <span className="flex items-center justify-center w-6 mr-5">
              {tab.icon}
            </span>

            {/* Label */}
            <span className="text-sm font-medium tracking-wide whitespace-nowrap">
              {tab.label}
            </span>

            {/* Active Indicator */}
            {currentTab === tab.key && (
              <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-current opacity-80 transition-all" />
            )}
          </Link>
        ))}
      </div>
    </div>
        </main>
  );
};

export default ProfileVerticalNav;