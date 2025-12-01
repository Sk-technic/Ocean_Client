import React from "react";
import { Sparkles } from "lucide-react";
import { useTheme } from "../../hooks/theme/usetheme";

interface AppNameProps {
  name: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const AppName: React.FC<AppNameProps> = ({
  name,
  showIcon = true,
  size = "md",
}) => {
  const { theme } = useTheme();

  // Font size options
  const textSize =
    size === "sm" ? "text-xl" : size === "lg" ? "text-5xl" : "text-3xl";

  // ✨ Premium Gradient — slightly more vivid
  const gradient = "linear-gradient(135deg, #5706daff 0%, #da0092ff 100%)";

  // 🌑 Darker shadow for depth + highlight for glow illusion
  const textShadow =  ` 0 1px 2px rgba(120 27 27 / 30%),
                        0 1px 6px rgba(81 78 179 / 20%),
                        0 0 15px rgba(254 5 171 / 25%)
                      `
   



  return (
    <div className="flex items-center gap-3 select-none transition-all duration-500">
      {/* === Gradient Icon === */}
      {showIcon && (
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.25)]"
          style={{
            background: gradient,
            boxShadow:
              theme === "dark"
                ? "0 0 15px rgba(155,92,255,0.4)"
                : "0 0 12px rgba(241,7,163,0.3)",
          }}
        >
          <Sparkles
            size={20}
            className="text-white opacity-95"
            strokeWidth={1.4}
          />
        </div>
      )}

      {/* === Gradient Text === */}
      <h1
        className={`${textSize} font-bold tracking-tight leading-none transition-all duration-500`}
        style={{
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow,
          letterSpacing: "0.6px",
          filter:
            theme === "dark"
              ? "brightness(1.4) contrast(1.1)"
              : "brightness(1.2) contrast(1.05)",
        }}
      >
        {name}
      </h1>
    </div>
  );
};

export default AppName;
