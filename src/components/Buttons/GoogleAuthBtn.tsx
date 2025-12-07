import React, { useRef } from "react";
import { FcGoogle } from "react-icons/fc";
import { useGoogleAuth } from "../../hooks/auth/authHooks";
interface GoogleAuthButtonProps {
  mode?: "login" | "signup";
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode = "login" }) => {
  const label = mode;
  const selectedMode = useRef<"login" | "signup">(mode);

  const { mutateAsync: googleAuthenticated } = useGoogleAuth();


  const handleClick = () => {
    window.location.href = "http://localhost:8000/api/v1/auth/google";
  };


  return (
    <main className="flex flex-col items-center justify-center gap-1">

      <button
        onClick={handleClick}
        className={`flex items-center justify-center gap-2 border theme-border p-2 hover:cursor-pointer dark:bg-rose-200/10 shadow-lg rounded-full`}>
        <FcGoogle size={22} />
        <span className="text-md theme-text-primary">{label}</span>
      </button>
    </main>
  );
};

export default GoogleAuthButton;
