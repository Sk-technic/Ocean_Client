import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../../hooks/theme/usetheme";

interface UploadImageInputProps {
  label?: string;
  name: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

export const UploadProfile: React.FC<UploadImageInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { theme } = useTheme();

  // Sync preview with parent value
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(value);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }
    onChange?.(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={clsx("w-full flex flex-col items-center gap-2", className)}>

      {/* === Circular Upload Container === */}
      <div
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "relative w-18 h-18 flex items-center justify-center rounded-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "border-2 dark:border-zinc-500 border-zinc-400 border-dashed backdrop-blur-lg group",
          error && "border-[var(--error)]",
          "dark:bg-zinc-800/40 bg-zinc-300"
        )}
      >
        {/* --- When no image --- */}
        {!preview ? (
          <>
            <div className="flex flex-col items-center text-center ">
              <ImagePlus
                size={22}
               
                />
              
            </div>

            <input
              ref={inputRef}
              id={name}
              name={name}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              required={required}
              />
          </>
        ) : (
          /* --- When image selected --- */
          <div className="relative w-full h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              className={`absolute -bottom-1 -right-1 p-[1px] flex items-center justify-center rounded-full shadow-md transition-all duration-200 
                dark:bg-white dark:hover:bg-[#2e1c4f] light:bg-black light:hover:bg-gray-100
              `}
            >
              <X
                size={12}
                className={clsx(
                  theme === "dark"
                    ? "text-gray-300 hover:text-gray-100"
                    : "text-gray-600 hover:text-gray-800"
                )}
              />
            </button>
          </div>
        )}
      </div>
      {label && (
        <label
          htmlFor={name}
          className="text-[10px] font-medium tracking-wide text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-0.5">*</span>}
        </label>
      )}

      {/* === Error Message === */}
      {error && (
        <p className="text-xs text-[var(--error)] font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
