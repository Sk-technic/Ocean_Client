import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;     
  thickness?: string; 
  index?:number
}

const ProcessLoader: React.FC<SpinnerProps> = ({
  size = 40,
  color = "var(--accent-primary)", // raw CSS variable
  thickness = "4px",
  index=1000
}) => {
  return (
    <div
      className={`animate-spin rounded-full border-solid border-transparent border-t-transparent`}
      style={{
        width: size,
        height: size,
        borderWidth: thickness,
        borderColor: color,   // apply color properly
        borderTopColor: "transparent", // hide top for spin effect
        zIndex:index
      }}
    />
  );
};

export default ProcessLoader;
