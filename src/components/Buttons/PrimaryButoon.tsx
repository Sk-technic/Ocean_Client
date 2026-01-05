import React from "react";
// import { Loader2 } from "lucide-react";
import clsx from "clsx";
import Loader from "../Loader/Loader";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  label: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  state?: string;
  width?:string;
  cancel?:boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  loading = false,
  icon,
  fullWidth = true,
  disabled,
  className,
  state,
  width,
  cancel,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={clsx(
        `
        cursor-pointer
        text-sm shadow-md
        relative overflow-hidden
        flex items-center justify-center gap-2 
        font-medium rounded-2xl
        transition-all duration-300 ease-[cubic-bezier(0.77,0,0.175,1)]
        focus:outline-none focus:ring-0 focus:ring-offset-0
        backdrop-blur-sm
        shadow-[0_3px_10px_rgba(0,0,0,0.08)] ${ cancel && 'border-2 theme-border'}
         'dark:shadow-[0_3px_15px_rgba(168,85,247,0.15)]
        disabled:opacity-60 disabled:cursor-not-allowed
        `,
        fullWidth ? "w-full": width || "w-50",
        className
      )}
    >
      <span
        className={clsx(
    `
    absolute inset-0 -z-10
    hover:opacity-90
    transition-opacity duration-300
    
    `,
    cancel
      ? "theme-bg-primary"
      : "gradient shadow-md"
  )}
      />

      <span
        className="
          absolute inset-0 -z-[5]
          bg-white/10 dark:bg-black/10
          rounded-lg
        "
      />

      {/* Content */}
      {loading ? (
        <>
          <span className="text-white">{state || "Processing..."}</span>
        <Loader size={20}/>
        </>
      ) : (
        <>
          {icon && <span className="w-5 h-5 text-zinc-200">{icon}</span>}
          <span className="theme-text-primary">{label}</span>
        </>
      )}
    </button>
  );
};

export default PrimaryButton;
