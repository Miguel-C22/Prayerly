"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/icon/Icon";
import ConfirmDeleteModal from "@/components/ui/modals/ConfirmDeleteModal";

interface BulkActionBarProps {
  selectionCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => Promise<void>;
  isDeleting?: boolean;
}

export default function BulkActionBar({
  selectionCount,
  onClearSelection,
  onDeleteSelected,
  isDeleting = false,
}: BulkActionBarProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await onDeleteSelected();
    setShowDeleteModal(false);
  };

  if (selectionCount === 0) {
    return null;
  }

  return (
    <>
      <div className="sticky top-4 z-20 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Selection count */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-text-purplePrimary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {selectionCount}
              </span>
            </div>
            <span className="text-text-grayPrimary font-medium text-sm sm:text-base">
              {selectionCount === 1
                ? "1 prayer selected"
                : `${selectionCount} prayers selected`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Clear selection button */}
            <button
              onClick={onClearSelection}
              className="h-10 px-4 rounded-full border border-border-gray bg-backgrounds-grayLight text-text-grayPrimary hover:bg-backgrounds-grayLight/80 transition-colors font-medium text-sm sm:text-base flex-1 sm:flex-none"
              disabled={isDeleting}
            >
              <span className="hidden sm:inline">Clear Selection</span>
              <span className="sm:hidden">Clear</span>
            </button>

            {/* Delete button */}
            <button
              onClick={handleDeleteClick}
              className="h-10 px-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex-1 sm:flex-none"
              disabled={isDeleting}
            >
              <Icon icon="trash" className="w-5 h-5 flex-shrink-0" />
              <span className="hidden sm:inline">
                {isDeleting ? "Deleting..." : "Delete Selected"}
              </span>
              <span className="sm:hidden">
                {isDeleting ? "Deleting..." : "Delete"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </>
  );
}
