import React from "react";
import Icon from "@/components/icon/Icon";
import { icons } from "@/consts/icons";

interface BadgeProps {
  icon: string;
}

function Badge({ icon }: BadgeProps) {
  // Map category names to actual icon names
  const getIconName = (category: string): keyof typeof icons => {
    switch (category) {
      case "family":
        return "family";
      case "friends":
        return "friends";
      case "personal":
        return "heart";
      case "health":
        return "health";
      default:
        return "heart";
    }
  };

  const getVariantClasses = () => {
    // Use icon name to determine color if icon is provided
    if (icon) {
      switch (icon) {
        case "family":
          return "badge-warning";
        case "friends":
          return "badge-primary";
        case "personal":
          return "badge-error";
        case "health":
          return "badge-info";
        default:
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
      }
    }
  };

  const iconName = getIconName(icon);
  const iconTitle = icon.charAt(0).toUpperCase() + icon.slice(1);

  return (
    <span className={`badge gap-1 ${getVariantClasses()}`}>
      {icon && <Icon icon={iconName} className="w-3 h-3" />}
      {iconTitle}
    </span>
  );
}

export default Badge;
