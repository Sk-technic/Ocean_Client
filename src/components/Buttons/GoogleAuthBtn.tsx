import React from "react";
import { FcGoogle } from "react-icons/fc";
interface GoogleAuthButtonProps {
  mode?: "login" | "signup";
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode = "login" }) => {
const text = mode =="login"?'login with google':"signup with goog le"
  const handleClick = () => {
    window.location.href = "http://localhost:8000/api/v1/auth/google";
  };


  return (
    <main className="flex flex-col items-center justify-center gap-1">

      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 border theme-border px-5 py-2 cursor-pointer theme-bg-primary hover:scale-105 duration-500 easy-in-out  shadow-lg rounded-2xl`}>
        <FcGoogle size={22} />
        <span className="text-sm theme-text-primary">{text}</span>
      </button>
    </main>
  );
};

export default GoogleAuthButton;
