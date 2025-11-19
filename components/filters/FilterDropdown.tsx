"use client";

import React, { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon/Icon";
import { PrayerCategory } from "@/types/prayer";

interface FilterDropdownProps {
  selectedCategories: string[];
  onToggleCategory: (category: string) => void;
  availableCategories?: PrayerCategory[];
}

const DEFAULT_CATEGORIES: PrayerCategory[] = [
  "personal",
  "family",
  "friends",
  "health",
  "work",
  "other",
];

const CATEGORY_LABELS: Record<PrayerCategory, string> = {
  personal: "Personal",
  family: "Family",
  friends: "Friends",
  health: "Health",
  work: "Work",
  other: "Other",
};

const CATEGORY_ICONS: Record<PrayerCategory, string> = {
  personal: "heart",
  family: "family",
  friends: "friends",
  health: "health",
  work: "guidance",
  other: "prayingHands",
};

export default function FilterDropdown({
  selectedCategories,
  onToggleCategory,
  availableCategories = DEFAULT_CATEGORIES,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filterCount = selectedCategories.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 px-4 rounded-full border border-border-gray bg-backgrounds-grayLight text-text-grayPrimary hover:bg-backgrounds-grayLight/80 transition-colors flex items-center gap-2 relative"
        aria-label="Filter by category"
      >
        <Icon icon="filter" className="w-5 h-5" />
        <span className="font-medium">Filter</span>
        {filterCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-text-purplePrimary text-white text-xs font-semibold">
            {filterCount}
          </span>
        )}
        <Icon
          icon="chevronDown"
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-56 bg-backgrounds-grayLight border border-border-gray rounded-2xl shadow-lg z-50 py-2">
          <div className="px-4 py-2 border-b border-border-gray">
            <h3 className="text-sm font-semibold text-text-grayPrimary">
              Filter by Category
            </h3>
          </div>

          <div className="py-1">
            {availableCategories.map((category) => {
              const isSelected = selectedCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => onToggleCategory(category)}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-backgrounds-veryLight transition-colors"
                >
                  {/* Checkbox */}
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-text-purplePrimary border-text-purplePrimary"
                        : "border-border-gray"
                    }`}
                  >
                    {isSelected && (
                      <Icon icon="check" className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* Icon */}
                  <Icon
                    icon={CATEGORY_ICONS[category] as any}
                    className="w-5 h-5 text-text-graySecondary"
                  />

                  {/* Label */}
                  <span className="text-sm text-text-grayPrimary flex-1 text-left">
                    {CATEGORY_LABELS[category]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
