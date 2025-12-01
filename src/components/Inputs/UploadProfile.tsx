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
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium tracking-wide text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-0.5">*</span>}
        </label>
      )}

      {/* === Circular Upload Container === */}
      <div
        onClick={() => inputRef.current?.click()}
        className={clsx(
          "relative w-25 h-25 flex items-center justify-center rounded-full cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]",
          "border-2 border-dashed backdrop-blur-xl overflow-hidden group",
          error
            ? "border-[var(--error)]"
            : theme === "dark"
            ? "border-[#5a4b8a]/60 hover:border-[#a855f7]/80 bg-[#1b1230]/40"
            : "border-gray-300 hover:border-indigo-400 bg-white/50",
          "shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_10px_rgba(0,0,0,0.08)]"
        )}
      >
        {/* --- When no image --- */}
        {!preview ? (
          <>
            <div className="flex flex-col items-center text-center">
              <ImagePlus
                size={22}
                className={clsx(
                  "transition-colors duration-300",
                  theme === "dark"
                    ? "text-[#a78bfa] group-hover:text-[#c4b5fd]"
                    : "text-gray-500 group-hover:text-indigo-500"
                )}
              />
              <p
                className={clsx(
                  "text-[10px] mt-2 font-Lucero",
                  theme === "dark"
                    ? "text-gray-400 group-hover:text-gray-300"
                    : "text-gray-500 group-hover:text-gray-700"
                )}
              >
                Upload Photo
              </p>
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
              className={clsx(
                "absolute top-2 right-2 p-1 rounded-full shadow-md transition-all duration-200",
                theme === "dark"
                  ? "bg-[#241a36] hover:bg-[#2e1c4f]"
                  : "bg-white hover:bg-gray-100"
              )}
            >
              <X
                size={14}
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

      {/* === Error Message === */}
      {error && (
        <p className="text-xs text-[var(--error)] font-medium mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
