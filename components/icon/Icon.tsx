import React from "react";
import { icons } from "@/consts/icons";

interface IconProps {
  icon: keyof typeof icons;
  color?: string;
  className?: string;
  strokeWidth?: number;
}

function Icon({
  icon,
  color = "currentColor",
  className = "",
  strokeWidth = 2,
}: IconProps) {
  return (
    <svg
      className={className || `w-6 h-6`}
      fill="none"
      stroke={color}
      viewBox="0 0 24 24"
      strokeWidth={strokeWidth}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={icons[icon]} />
    </svg>
  );
}

export default Icon;
