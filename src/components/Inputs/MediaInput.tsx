import React, { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import clsx from "clsx";

interface UploadMediaIconInputProps {
  name: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  accept?: "image" | "video" | "both";
  className?: string;
}

const MediaInput: React.FC<UploadMediaIconInputProps> = ({
  name,
  value,
  onChange,
  accept = "both",
  className,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const fileAccept =
    accept === "image"
      ? "image/*"
      : accept === "video"
      ? "video/*"
      : "image/*,video/*";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      alert("Please select only image or video files.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange?.(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={clsx("relative flex items-center gap-2", className)}>
      {/* Upload Button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center justify-center w-12 h-12 rounded-full border border-gray-300 dark:border-gray-700 
                   bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 
                   text-gray-600 dark:text-gray-300 transition"
      >
        <UploadCloud size={22} />
      </button>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={fileAccept}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Preview */}
      {preview && (
        <div className="relative w-20 h-20">
          {value?.type.startsWith("image/") ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
          ) : (
            <video
              src={preview}
              className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600"
              muted
            />
          )}

          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 bg-white dark:bg-gray-800 p-1 rounded-full shadow hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={14} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaInput;


// example:
// <div className="flex items-center gap-3">
//         <MediaInput
//           name="media"
//           value={mediaFile}
//           onChange={setMediaFile}
//           accept="both" // or "image" | "video"
//         />
//         <span className="text-sm text-gray-600 dark:text-gray-300">
//           Upload image or video
//         </span>
//       </div>
