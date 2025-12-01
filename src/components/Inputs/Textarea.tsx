import React from "react";
import clsx from "clsx";

interface TextAreaFieldProps {
  label?: string;
  name: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
  autoResize?: boolean;
  maxLength?: number;
  className?: string;
}

const TextArea: React.FC<TextAreaFieldProps> = ({
  label,
  name,
  value,
  placeholder,
  onChange,
  error,
  required,
  rows = 4,
  autoResize = false,
  maxLength,
  className,
}) => {
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (autoResize) {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
    onChange?.(e);
  };

  return (
    <div className={clsx("w-full flex flex-col space-y-1", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-[var(--text-secondary)]"
        >
          {label}
          {required && <span className="text-[var(--error)] ml-0.5">*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={handleInput}
        rows={rows}
        maxLength={maxLength}
        required={required}
        className={clsx(
          "w-full rounded-xl border px-4 py-2 text-sm outline-none transition-all duration-300",
          "bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--input-text)] placeholder:text-[var(--text-muted)]",
          "focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)]",
          error && "border-[var(--error)] focus:ring-[var(--error)]"
        )}
      />

      {maxLength && (
        <div className="text-xs text-[var(--text-muted)] text-right">
          {value?.length ?? 0}/{maxLength}
        </div>
      )}

      {error && <p className="text-xs text-[var(--error)] font-medium">{error}</p>}
    </div>
  );
};

export default TextArea;
