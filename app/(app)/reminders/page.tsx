import AppLayout from "@/components/layout/AppLayout";
import React from "react";
import RemindersPageClient from "./RemindersPageClient";
import { getReminders } from "@/utils/server/remindersServer";
import { getPrayers } from "@/utils/server/prayersServer";
import Icon from "@/components/icon/Icon";

async function page() {
  const reminders = await getReminders();
  const prayers = await getPrayers();

  const combinedData = reminders.map((reminder) => {
    const relatedPrayer = prayers.find(
      (prayer) => prayer.id === reminder.prayer_id
    );
    return {
      prayerId: reminder.prayer_id,
      prayerTitle: relatedPrayer ? relatedPrayer.title : "Unknown Prayer",
      recurrence_type: reminder.recurrence_type || "One-time",
      prayerCategory: relatedPrayer ? relatedPrayer.category : "Uncategorized",
      is_active: reminder.is_active,
    };
  });

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Email Reminders Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-backgrounds-lavender rounded-lg flex items-center justify-center">
              <Icon icon="email" className="w-6 h-6 text-text-purplePrimary" />
            </div>
            <h2 className="text-xl font-semibold text-text-grayPrimary">
              Email Reminders
            </h2>
          </div>
          <p className="text-text-graySecondary text-sm leading-relaxed">
            We'll send you peaceful, scripture-filled email reminders to pray
            for your requests. You can customize the timing and frequency for
            each prayer request.
          </p>
        </div>

        <RemindersPageClient reminders={combinedData} />
      </div>
    </AppLayout>
  );
}

export default page;
