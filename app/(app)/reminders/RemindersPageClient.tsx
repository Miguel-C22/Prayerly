"use client";

import ActiveReminders from "@/components/reminders/ActiveReminders";
import PausedReminders from "@/components/reminders/PausedReminders";
import React, { useEffect, useState } from "react";

export interface RemindersPageClientProps {
  reminders: {
    prayerId: string;
    prayerTitle: string;
    recurrence_type: string;
    prayerCategory: string;
    is_active: boolean;
  }[];
}

function RemindersPageClient({ reminders }: RemindersPageClientProps) {
  const [remindersState, setRemindersState] = useState(reminders);
  useEffect(() => {
    setRemindersState(reminders);
  }, [reminders]);

  const activeReminders = remindersState.filter(
    (reminder) => reminder.is_active
  );
  const pausedReminders = remindersState.filter(
    (reminder) => !reminder.is_active
  );

  return (
    <>
      <ActiveReminders
        reminders={activeReminders}
        setReminderState={setRemindersState}
      />
      <PausedReminders
        reminders={pausedReminders}
        setReminderState={setRemindersState}
      />
    </>
  );
}

export default RemindersPageClient;
