"use client";

import React, { useEffect, useState } from "react";
import Icon from "@/components/ui/icon/Icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search prayers...",
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value when it changes externally
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className="relative flex-1">
      {/* Search icon */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <Icon icon="search" className="w-5 h-5 text-text-graySecondary" />
      </div>

      {/* Input field */}
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-10 rounded-full border border-border-gray bg-backgrounds-grayLight text-text-grayPrimary placeholder:text-text-graySecondary focus:outline-none focus:ring-2 focus:ring-text-purplePrimary focus:border-transparent transition-all"
      />

      {/* Clear button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-graySecondary hover:text-text-grayPrimary transition-colors"
          aria-label="Clear search"
        >
          <Icon icon="close" className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
