import React from "react";
import { ChevronLeft, Settings } from "lucide-react";
import { useAppSelector } from "../../../store/hooks";
import { optimizeUrl } from "../../../utils/imageOptimize";
import { useNavigate } from "react-router-dom";

const NotificationHeader: React.FC = () => {
  const { user: loggedInUser } = useAppSelector((state) => state.auth)
  const Navigate = useNavigate()
  return (
    <header
      className="
        w-full max-w-8xl px-4 py-2
        border theme-border
        shadow-lg
        flex items-center justify-between
        theme-bg-card  
        sticky top-0 z-50 
        backdrop-blur-xl
        animate-fadeIn
        rounded-xl
      "
    >
      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* USER DETAILS */}
        <div className="flex items-center gap-3 hover:cursor-pointer"
          onClick={() => Navigate("/dashboard")}
        >
          {/* Profile Pic with Gradient Ring */}
          <div className="relative
            bg-[var(--text-muted)]
            rounded-full
            p-[1.5px]
          ">
            <div
              className="
              p-[2px]
              rounded-full 
              theme-bg-secondary
              "
            >
              <img
                src={optimizeUrl(loggedInUser?.profilePic!, 400) || './profile.png'}
                alt={loggedInUser?.username}
                className="w-12 h-12 rounded-full object-cover theme-bg-secondary"
              />
            </div>
          </div>

          {/* Username + Name */}
          <div className="flex flex-col">
            <h2 className="font-semibold theme-text-primary text-sm leading-tight">
              {loggedInUser?.fullName}
            </h2>
            <p className="text-xs theme-text-muted">@{loggedInUser?.username}</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex gap-3 items-center justify-center">
        <h1>notfications</h1>
        <button
          className="
            p-2 rounded-xl
            theme-bg-secondary theme-hover-effect 
            transition-all
          "
        >
          <Settings size={20} className="theme-text-primary" />
        </button>
      </div>
    </header>
  );
};

export default NotificationHeader;
