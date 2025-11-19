import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import Icon from "@/components/ui/icon/Icon";
import ConfirmDeleteModal from "@/components/ui/modals/ConfirmDeleteModal";
import Input from "@/components/ui/input/Input";
import TextArea from "@/components/ui/text-area/TextArea";
import { cardStyles } from "./cardStyles";

interface ContentCardProps {
  variant: "prayer" | "reflection" | "combo";
  id: string;
  title?: string;
  description?: string;
  reflection?: string;
  date: string;
  category?: string;
  reflectionType?: string;
  setSelectedPrayerId?: (id: string) => void;
  edit?: boolean;
  hideBtn?: boolean;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
  onReflectionChange?: (reflection: string) => void;
  onDelete?: (id: string) => void;
  // Bulk selection props
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}

function ContentCard({
  variant,
  id,
  title = "",
  description = "",
  reflection = "",
  date,
  category,
  setSelectedPrayerId,
  edit = false,
  hideBtn = false,
  onTitleChange,
  onDescriptionChange,
  onReflectionChange,
  onDelete,
  selectable = false,
  isSelected = false,
  onToggleSelection,
}: ContentCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const titleDisplayLength = 10;
  const descriptionDisplayLength = 40;

  const handleConfirmDelete = () => {
    onDelete?.(id);
    setShowDeleteModal(false);
  };

  const handleTitleChange: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    const newValue = typeof value === "function" ? value(title) : value;
    onTitleChange?.(newValue);
  };

  const handleDescriptionChange: React.Dispatch<
    React.SetStateAction<string>
  > = (value) => {
    const newValue = typeof value === "function" ? value(description) : value;
    onDescriptionChange?.(newValue);
  };

  const handleReflectionChange: React.Dispatch<React.SetStateAction<string>> = (
    value
  ) => {
    const newValue = typeof value === "function" ? value(reflection) : value;
    onReflectionChange?.(newValue);
  };

  if (variant === "reflection") {
    return (
      <div className={`${cardStyles.base} h-full flex flex-col`}>
        <div className="card-body p-4 flex flex-col flex-1">
          {/* Date with calendar icon */}
          <div className="flex items-center gap-2 mb-3">
            <Icon icon="calendar" className="w-4 h-4 text-text-graySecondary" />
            <span className="text-sm text-text-graySecondary">{date}</span>
          </div>

          {/* Reflection text with purple left border */}
          <div className="border-l-4 border-text-purplePrimary pl-4 flex-1">
            {edit ? (
              <TextArea
                value={reflection}
                setValue={handleReflectionChange}
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

  // Render prayer and combo variants (they're very similar)
  return (
    <div
      className={`${cardStyles.base} rounded-lg relative h-full flex flex-col ${
        isSelected ? "ring-2 ring-text-purplePrimary" : ""
      }`}
    >
      {/* Selection checkbox - show when selectable */}
      {selectable && onToggleSelection && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection(id);
          }}
          className="absolute top-4 left-4 z-10"
          aria-label={isSelected ? "Deselect item" : "Select item"}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isSelected
                ? "bg-text-purplePrimary border-text-purplePrimary"
                : "border-border-gray bg-white dark:bg-backgrounds-grayLight hover:border-text-purplePrimary shadow-sm"
            }`}
          >
            {isSelected && (
              <Icon icon="check" className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </button>
      )}

      {/* Delete button - only show when not in edit mode and not in selection mode */}
      {!edit && onDelete && !selectable && (
        <>
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteModal(false)}
          />
        </>
      )}

      <div
        className={`card-body p-4 flex flex-col flex-1 ${
          selectable ? "pl-12" : ""
        }`}
      >
        {/* Header with title and category */}
        <div className="flex justify-between items-start mb-2 gap-2 pr-10">
          {edit ? (
            <Input
              type="text"
              value={title}
              setValue={handleTitleChange}
              placeholder="Prayer title..."
            />
          ) : (
            <h3 className="text-lg font-semibold text-text-grayPrimary">
              {title.length > titleDisplayLength
                ? title.slice(0, titleDisplayLength) + "..."
                : title}
            </h3>
          )}
          {category && <Badge icon={category} />}
        </div>

        {/* Description/Reflection - combo uses reflection, prayer uses description */}
        {variant === "combo" ? (
          <div className="border-l-4 border-text-purplePrimary pl-4 mb-4 flex-1">
            <p className="text-text-graySecondary">{reflection}</p>
          </div>
        ) : edit ? (
          <div className="mb-4">
            <TextArea
              value={description}
              setValue={handleDescriptionChange}
              placeholder="Prayer description..."
              rows={3}
            />
          </div>
        ) : (
          <p className="text-text-graySecondary mb-4 flex-1">
            {description.length > descriptionDisplayLength
              ? description.slice(0, descriptionDisplayLength) + "..."
              : description}
          </p>
        )}

        {/* Footer with date and view details */}
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-1 text-text-graySecondary text-sm">
            <Icon icon="calendar" className="w-4 h-4" />
            <span>{date}</span>
          </div>
          {!hideBtn && (
            <label
              htmlFor="view-prayer"
              className="font-semibold !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 inline-flex items-center justify-center gap-2 border-2 bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-border-gray h-10 px-4 text-sm cursor-pointer"
              onClick={() => setSelectedPrayerId && setSelectedPrayerId(id)}
            >
              {variant === "combo" ? "View Prayer Details" : "View Details"}
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContentCard;
