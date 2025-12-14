import React, { useRef } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";

interface SearchInputProps {
  label?: string;
  name: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (query: string) => void;
  onClear: () => void;
  error?: string;
  required?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  name,
  placeholder = "Search",
  value,
  onChange,
  onSearch,
  onClear,
  error,
  required,
  className,
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(value || "");
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onClear();
  };

  return (
    <div
      className={clsx(
        "w-full flex flex-col gap-2 bg-transparent animate-fadeIn",
        "transition-all duration-300 ease-in-out",
        className
      )}
    >
      {/* === Search Input Container === */}
      <form onSubmit={handleSubmit} className="relative bg-transparent">
        <div
          className={clsx(
            "relative group  theme-bg-primary overflow-hidden transition-all",
            "rounded-xl border theme-border shadow-md",
            "backdrop-blur-md bg-transparent" // 👈 ensures full transparency with blur effect if needed
          )}
        >
          {/* === Search Icon === */}
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search
              size={20}
              className={clsx(
                "transition-colors duration-300",
                value
                  ? "text-[var(--accent-primary)]"
                  : "text-[var(--text-muted)]"
              )}
            />
          </div>

          {/* === Input Field === */}
          <input
            ref={inputRef}
            id={name}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            autoFocus={autoFocus}
            className={clsx(
              "w-full px-12 py-3 text-[16px] outline-none",
              "bg-transparent text-[var(--input-text)] placeholder:text-zinc-400",
              "transition-all duration-300 ease-in-out font-Lucero placeholder:font-Lucero",
              "selection:bg-transparent selection:text-inherit"
            )}
          />

          {/* === Action Buttons Container === */}
          <div className="absolute inset-y-0 right-3 flex items-center space-x-1">
            {value && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={handleClear}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all duration-200"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* === Gradient Border Highlight (bottom bar) === */}
          <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500 ease-out group-focus-within:w-full" />
        </div>
      </form>

      {error && (
        <p className="text-xs text-[var(--error)] font-medium mt-1 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchInput;
