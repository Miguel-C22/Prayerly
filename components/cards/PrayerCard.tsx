import React from "react";
import Badge from "@/components/badge/Badge";
import Icon from "@/components/icon/Icon";

interface PrayerCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  setSelectedPrayerId?: (id: string) => void;
  edit?: boolean;
  hideBtn?: boolean;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

function PrayerCard({
  title,
  description,
  date,
  id,
  setSelectedPrayerId,
  edit = false,
  category,
  hideBtn = false,
  onTitleChange,
  onDescriptionChange,
}: PrayerCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      {/* Header with title and category */}
      <div className="flex justify-between items-start mb-2 gap-2">
        {edit ? (
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange?.(e.target.value)}
            className="input w-full"
            placeholder="Prayer title..."
          />
        ) : (
          <h3 className="text-lg font-semibold text-text-grayPrimary">
            {title}
          </h3>
        )}
        <Badge icon={`${category}`} />
      </div>

      {/* Description */}
      {edit ? (
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          className="textarea w-full mb-4"
          placeholder="Prayer description..."
          rows={3}
        />
      ) : (
        <p className="text-text-graySecondary mb-4">{description}</p>
      )}

      {/* Footer with prayer days and view details */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1 text-text-graySecondary text-sm">
          <Icon icon="calendar" className="w-4 h-4" />
          <span>{date}</span>
        </div>
        {!hideBtn ? (
          <label
            htmlFor="view-prayer"
            className="border border-gray-300 bg-backgrounds-grayLight rounded-lg px-4 py-2 text-text-grayPrimary text-sm font-medium hover:bg-gray-50"
            onClick={() => setSelectedPrayerId && setSelectedPrayerId(id)}
          >
            View Details
          </label>
        ) : null}
      </div>
    </div>
  );
}

export default PrayerCard;
