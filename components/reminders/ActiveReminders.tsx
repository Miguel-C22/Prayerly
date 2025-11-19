import React from "react";
import ReminderCard from "@/components/ui/cards/ReminderCard";
import Icon from "@/components/ui/icon/Icon";
import { RemindersPageClientProps } from "@/app/(app)/reminders/RemindersPageClient";

interface ActiveRemindersProps extends RemindersPageClientProps {
  setReminderState: React.Dispatch<
    React.SetStateAction<RemindersPageClientProps["reminders"]>
  >;
}

function ActiveReminders({
  reminders,
  setReminderState,
}: ActiveRemindersProps) {
  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-backgrounds-lavender rounded-lg flex items-center justify-center">
          <Icon icon="calendar" className="w-5 h-5 text-text-purplePrimary" />
        </div>
        <h3 className="text-lg font-semibold text-text-grayPrimary">
          Active Reminders
        </h3>
      </div>

      {/* Reminder Cards */}
      {reminders.length === 0 ? (
        <p className="text-text-graySecondary text-center">
          No Active Prayer Reminders
        </p>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <ReminderCard
              prayerId={reminder.prayerId}
              key={reminder.prayerId}
              title={reminder.prayerTitle}
              time={reminder.recurrence_type}
              category={reminder.prayerCategory}
              isEnabled={reminder.is_active}
              setReminderState={setReminderState}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ActiveReminders;
