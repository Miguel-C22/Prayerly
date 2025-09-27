import React from "react";
import Badge from "../badge/Badge";
import Icon from "../icon/Icon";

interface ComboCardProps {
  id: string;
  title: string;
  reflection: string; // instead of description
  date: string;
  category?: string;
  reflectionType?: string; // if you need to show reflection type
  // other props you need
  setSelectedPrayerId?: (id: string) => void;
}

function ComboCard({
  id,
  title,
  reflection,
  date,
  category,
  setSelectedPrayerId,
}: ComboCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header with title and category */}
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-lg font-semibold text-text-grayPrimary">{title}</h3>

        <Badge icon={`${category}`} />
      </div>

      {/* Description */}
      <div className="border-l-4 border-text-purplePrimary pl-4">
        <p className="text-text-graySecondary mb-2">{reflection}</p>
      </div>

      {/* Footer with prayer days and view details */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-text-graySecondary text-sm">
          <Icon icon="calendar" className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <label
          htmlFor="view-prayer"
          className="border border-gray-300 bg-backgrounds-grayLight rounded-lg px-4 py-2 text-text-grayPrimary text-sm font-medium hover:bg-gray-50"
          onClick={() => setSelectedPrayerId && setSelectedPrayerId(id)}
        >
          View Prayer Details
        </label>
      </div>
    </div>
  );
}

export default ComboCard;
