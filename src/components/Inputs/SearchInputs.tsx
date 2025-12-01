import React from "react";
import { Search } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps {
  label?: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
  error?: string;
  required?: boolean;
  className?: string;
  rounded?:string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  name,
  placeholder = "Search...",
  value,
  onChange,
  onSearch,
  error,
  required,
  className,
  rounded
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value || "");
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value || "");
    }
  };

  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-2 animate-fadeIn",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* === Label Above === */}
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-Lucero tracking-wide text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-0.5">*</span>}
        </label>
      )}

      {/* === Search Input Container === */}
      <div
        className={clsx(
          `rounded-${rounded}`,
          "relative group  overflow-hidden transition-all",
          "bg-[var(--input-bg)] border border-[var(--input-border)]",
          "hover:border-[var(--accent-primary-hover)] focus-within:border-[var(--accent-primary)]",
        ) }
      >
    

        {/* === Search Input Field === */}
        <input
          id={name}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          required={required}
          className={clsx(
            "w-full px-8 py-2 text-[18px] outline-none bg-transparent",
            " placeholder:text-zinc-400",
            "transition-all duration-300 ease-in-out",
            "font-Lucero placeholder:font-normal"
          )}
        />

        {/* === Search Button (Optional) === */}
        {onSearch && (
          <button
            type="button"
            aria-label="Search"
            onClick={handleSearchClick}
            className="absolute inset-y-0 right-3 flex items-center text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
          >
            <Search size={24} />
          </button>
        )}
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

export default SearchInput;