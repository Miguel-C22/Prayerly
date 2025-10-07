import React, { useState } from "react";
import Badge from "@/components/badge/Badge";
import Icon from "@/components/icon/Icon";
import ConfirmDeleteModal from "../modals/ConfirmDeleteModal";

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
  onDelete?: (id: string) => void;
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
  onDelete,
}: PrayerCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.(id);
    setShowDeleteModal(false);
  };
  return (
    <div className="bg-backgrounds-white border border-border-gray rounded-lg p-4 shadow-sm relative">
      {/* Delete button - only show when not in edit mode */}
      {!edit && onDelete && (
        <>
          <button
            onClick={handleDeleteClick}
            className="absolute top-3 right-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            aria-label="Delete prayer"
          >
            <Icon icon="trash" className="w-5 h-5" />
          </button>
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        </>
      )}

      {/* Header with title and category */}
      <div className="flex justify-between items-start mb-2 gap-2 pr-10">
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
            className="border border-border-gray bg-backgrounds-grayLight rounded-lg px-4 py-2 text-text-grayPrimary text-sm font-medium hover:bg-backgrounds-light transition-colors cursor-pointer"
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
