import React from "react";
import Icon from "@/components/icon/Icon";

interface ReflectionCardProps {
  date: string;
  reflection: string;
  edit?: boolean;
  onReflectionChange?: (reflection: string) => void;
}

function ReflectionCard({ date, reflection, edit, onReflectionChange }: ReflectionCardProps) {
  return (
    <div className="card bg-base-100 border border-gray-200 shadow-sm">
      <div className="card-body p-4">
        {/* Date with calendar icon */}
        <div className="flex items-center gap-2 mb-3">
          <Icon icon="calendar" className="w-4 h-4 text-text-graySecondary" />
          <span className="text-sm text-text-graySecondary">{date}</span>
        </div>

        {/* Reflection text with purple left border */}
        <div className="border-l-4 border-text-purplePrimary pl-4">
          {edit ? (
            <textarea
              value={reflection}
              onChange={(e) => onReflectionChange?.(e.target.value)}
              className="textarea w-full"
              placeholder="Enter your reflection..."
              rows={3}
            />
          ) : (
            <p className="text-text-grayPrimary italic text-sm leading-relaxed">
              "{reflection}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReflectionCard;
