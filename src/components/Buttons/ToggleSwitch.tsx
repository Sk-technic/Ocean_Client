import React from "react";
import { Check } from "lucide-react";

interface ToggleSwitchProps {
  value: boolean;
  onClick: () => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  value,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-14 h-8 rounded-full p-1 flex items-center
        transition-all duration-300 shadow-md
        ${
          value
            ? "bg-gradient-to-r from-purple-500 to-blue-400 shadow-inner"
            : "bg-gray-300 shadow-sm"
        }
        ${className}
      `}
    >
      <div
        className={`
          w-6 h-6 rounded-full bg-white shadow-lg
          flex items-center justify-center
          transform transition-all duration-300
          ${value ? "translate-x-6" : "translate-x-0"}
        `}
      >
        {value && <Check size={16} className="text-blue-600" />}
      </div>
    </button>
  );
};

export default ToggleSwitch;
