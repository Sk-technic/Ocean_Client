import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";
import { VscCircle } from "react-icons/vsc";

interface InputFieldProps {
  label?: string;
  name: string;
  type?: "text" | "email" | "password" | "tel" | "search";
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  required,
  className,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div
      className={clsx(
        "w-full flex flex-col animate-fadeIn ",
        "transition-all  duration-300  ease-in-out",
        className
      )}
      >
      {/* === Label Above === */}
      {label && (
        <label
          htmlFor={name}
          className="text-xs  px-1 font-Lucero flex tracking-wide text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-blue-500"><VscCircle/></span>}
        </label>
      )}

      {/* === Input Container === */}
      <div
        className={clsx(
          "relative group rounded-xl overflow-hidden transition-all p-1",
          "theme-bg-primary shadow-md border theme-border",
          "hover:border-[var(--accent-primary-hover)]/30 focus-within:border-[var(--accent-primary)]/20",
          // "rounded-t-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_0_8px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04),0_0_10px_rgba(255,255,255,0.05)]",
          // "focus-within:shadow-[0_0_15px_rgba(123,47,247,0.25)] dark:focus-within:shadow-[0_0_12px_rgba(168,85,247,0.35)]"
        )}
        >
        {/* === Input Field === */}
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={clsx(
            "w-full p-2 text-sm outline-none bg-transparent select-transparent",
            "text-[var(--input-text)]/80 placeholder:text-[12px]",
            "transition-all duration-300 ease-in-out",
            "font-Lucero placeholder:font-Lucero"
          )}
          />

        {/* === Password Toggle === */}
        {type === "password" && (
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* === Gradient Border Highlight (bottom bar) === */}
        <span
          className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500 ease-out group-focus-within:w-full"
        ></span>
      </div>

      {/* === Error Message === */}
      {error && (
        <p className="text-xs text-[var(--error)] font-medium mt-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
