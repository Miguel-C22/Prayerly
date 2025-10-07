import React from "react";
import Icon from "../icon/Icon";
import { icons } from "@/consts/icons";

interface StatCardProps {
  amount: number;
  icon: keyof typeof icons;
  description: string;
}

function StatCard({ amount, icon, description }: StatCardProps) {
  return (
    <div className="card bg-backgrounds-veryLight shadow-sm border border-border-gray rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center text-center min-h-[160px] sm:min-h-[180px] w-full max-w-xs mx-auto">
      {/* Icon */}
      <div className="mb-3 sm:mb-4">
        <Icon
          icon={icon}
          className="w-8 h-8 sm:w-10 sm:h-10 text-text-purplePrimary"
        />
      </div>

      {/* Amount */}
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-grayPrimary">
          {amount}
        </h2>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-text-graySecondary font-medium">
        {description}
      </p>
    </div>
  );
}

export default StatCard;
