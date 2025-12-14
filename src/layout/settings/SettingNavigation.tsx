import { Link } from "react-router-dom";
import { Ban, MapPin,Lock,UserRound, MessageCircle, AtSign, MessageSquare, Share2, Shield, EyeOff, SlidersHorizontal, Heart } from "lucide-react";
import type React from "react";
import { RiUserLine } from "react-icons/ri";
import { HiOutlineShieldCheck } from "react-icons/hi2";
import { LiaUserShieldSolid } from "react-icons/lia";

// Example data
const sections = [
  {
    title: "Privacy Settings",
    items: [
      { label: "Account privacy", icon: <RiUserLine size={18} />, to: "privacy_settings/account_privacy" },
      { label: "Privacy & Security", icon: <Lock size={18} />, to: "privacy_settings/privacy_security" },
      { label: "Blocked", icon: <Ban size={18} />, to: "privacy_settings/blocked" },
      { label: "Story and location", icon: <MapPin size={18} />, to: "/settings/story-location" },
    ],
  },
  {
    title: "How others can interact with you",
    items: [
      { label: "Messages and story replies", icon: <MessageCircle size={18} />, to: "/settings/messages" },
      { label: "Tags and mentions", icon: <AtSign size={18} />, to: "/settings/tags" },
      { label: "Comments", icon: <MessageSquare size={18} />, to: "/settings/comments" },
      { label: "Sharing", icon: <Share2 size={18} />, to: "/settings/sharing" },
      { label: "Restricted accounts", icon: <Shield size={18} />, to: "/settings/restricted" },
      { label: "Hidden Words", icon: <SlidersHorizontal size={18} />, to: "/settings/hidden-words" },
    ],
  },
  {
    title: "What you see",
    items: [
      { label: "Muted accounts", icon: <EyeOff size={18} />, to: "/settings/muted" },
      { label: "Content preferences", icon: <SlidersHorizontal size={18} />, to: "/settings/content-preferences" },
      { label: "Like and share counts", icon: <Heart size={18} />, to: "/settings/likes-shares" },
    ],
  },
];

const SettingNavigation: React.FC = () => {
  return (
    <div className="text-white h-full overflow-y-auto custom-scrollbar theme-text-primary">
        <h1 className="text-lg font-[800] py-2">Settings</h1>
        <section className="p-2 flex flex-col items-center w-full justify-start">
      <div className="border theme-border theme-bg-secondary gap-1 rounded-xl px-4 py-3 flex flex-col items-start justify-center w-full">

        <div className="relative w-full flex items-center justify-start ">
          <img
            src={'/Ocean_logo.png'}
            alt="Ocean"
            className="h-5 w-5  absolute bottom-[2px]"
            loading="lazy"
          />
        <span className=" ml-5 inline-block text-[14px]">Ocean</span>
        </div>
        <h1 className="text-sm font-black">Account Center</h1>
        <p className="text-[10px] theme-text-muted w-60">
          Manage your connected experiences and account settings across Ocean
          technologies.
        </p>


        <div className="space-y-1 text-[10px] theme-text-muted mt-1">
          <div className="flex items-center gap-3">
            <span><RiUserLine  className="theme-text-muted" size={14}/></span>
             Personal details
          </div>
          <div className="flex items-center gap-3">
            <span><HiOutlineShieldCheck className="theme-text-muted" size={14}/></span>
             Password and security
          </div>
          <div className="flex items-center gap-3">
            <span><LiaUserShieldSolid className="theme-text-muted" size={14}/></span>
            Account ownership

          </div>
        </div>


        <p className="text-[10px] text-blue-400 mt-2 cursor-pointer hover:underline">
          See more in Accounts Center
        </p>
      </div>
      </section>
      {sections.map((section, index) => (
        <div key={index} className="mb-5">
          <h3 className="text-[10px] text-gray-400 mb-3 px-4 uppercase tracking-wide">
            {section.title}
          </h3>

          <div className="bg-transparent space-y-2 theme-text-muted p-2 overflow-hidden ">
            {section.items.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="flex items-end shadow-md gap-[3px] p-2 rounded-xl border theme-border theme-hover-effect transition cursor-pointer"
              >
                <span className="mb-[2.5px]">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


export default SettingNavigation