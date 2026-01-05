import React, { useRef, useState } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import { FiUploadCloud } from "react-icons/fi";

interface MediaInputProps {
  name: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
}

const MediaInput: React.FC<MediaInputProps> = ({
  name,
  value,
  onChange,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Only image allowed
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file only");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div
      className={clsx(
        "relative w-18 h-18 rounded-full border-2 border-dashed theme-border bg-white/10 cursor-pointer overflow-hidden flex items-center justify-center hover:opacity-70 transition",
        className
      )}
      onClick={() => inputRef.current?.click()}
    >
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview or placeholder */}
      {preview ? (
        <img
          src={preview}
          alt="preview"
          className="w-full h-full object-cover"
        />
      ) : (
        <FiUploadCloud/>
      )}

      {/* Remove button */}
      {preview && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default MediaInput;
