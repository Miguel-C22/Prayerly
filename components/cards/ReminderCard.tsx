"use client";

import React, { useState } from "react";
import Icon from "../icon/Icon";
import Badge from "../badge/Badge";
import { updateReminder } from "@/utils/client/remindersClient";

interface ReminderCardProps {
  prayerId: string;
  title: string;
  time: string;
  category: string;
  isEnabled?: boolean;
  isPaused?: boolean;
  setReminderState: React.Dispatch<
    React.SetStateAction<
      {
        prayerId: string;
        prayerTitle: string;
        recurrence_type: string;
        prayerCategory: string;
        is_active: boolean;
      }[]
    >
  >;
}

function ReminderCard({
  prayerId,
  title,
  time,
  category,
  isEnabled = true,
  isPaused = false,
  setReminderState,
}: ReminderCardProps) {
  const [enabled, setEnabled] = useState(isEnabled);

  const handleToggle = async () => {
    const newEnabledState = !enabled;
    // Optimistic UI update
    setEnabled(newEnabledState);
    setReminderState((prevReminders) =>
      prevReminders.map((reminder) =>
        reminder.prayerId === prayerId
          ? { ...reminder, is_active: newEnabledState }
          : reminder
      )
    );

    try {
      await updateReminder(newEnabledState, prayerId);
    } catch (error) {
      // Revert on error
      setEnabled(enabled);
      setReminderState((prevReminders) =>
        prevReminders.map((reminder) =>
          reminder.prayerId === prayerId
            ? { ...reminder, is_active: enabled }
            : reminder
        )
      );
      console.error("Failed to update reminder:", error);
    }
  };

  return (
    <div className="bg-backgrounds-white border border-border-gray rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left side content */}
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold mb-1 ${
              isPaused ? "text-text-graySecondary" : "text-text-grayPrimary"
            }`}
          >
            {title}
          </h3>
          <div className="flex items-center gap-1 text-text-graySecondary text-sm">
            <Icon icon="calendar" className="w-4 h-4" />
            <span>{time}</span>
          </div>
        </div>

        {/* Right side - category and toggle */}
        <div className="flex items-center gap-3">
          <Badge icon={category} />

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={enabled}
              onChange={(e) => {
                setEnabled(e.target.checked);
                handleToggle();
              }}
            />
            <div className="w-11 h-6 bg-backgrounds-grayLight peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-backgrounds-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
}

export default ReminderCard;
