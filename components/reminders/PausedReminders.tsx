import React from "react";
import ReminderCard from "../cards/ReminderCard";
import { RemindersPageClientProps } from "@/app/(app)/reminders/RemindersPageClient";

interface PausedRemindersProps extends RemindersPageClientProps {
  setReminderState: React.Dispatch<
    React.SetStateAction<RemindersPageClientProps["reminders"]>
  >;
}

function PausedReminders({
  reminders,
  setReminderState,
}: PausedRemindersProps) {
  const pausedReminders = reminders.filter((reminder) => !reminder.is_active);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-text-graySecondary">
          Paused Reminders
        </h3>
      </div>

      {/* Reminder Cards */}
      {reminders.length === 0 ? (
        <p className="text-text-graySecondary text-center">
          No Paused Prayer Reminders
        </p>
      ) : (
        <div className="space-y-4">
          {pausedReminders.map((reminder) => (
            <ReminderCard
              prayerId={reminder.prayerId}
              key={reminder.prayerId}
              title={reminder.prayerTitle}
              time={reminder.recurrence_type}
              category={reminder.prayerCategory}
              isEnabled={reminder.is_active}
              isPaused={true}
              setReminderState={setReminderState}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PausedReminders;
