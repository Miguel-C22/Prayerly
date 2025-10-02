import * as React from "react";

interface PrayerReminderEmailProps {
  prayerTitle: string;
  prayerDescription: string;
  category: string;
}

export function PrayerReminderEmail({
  prayerTitle,
  prayerDescription,
  category,
}: PrayerReminderEmailProps) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px" }}>
      <h1 style={{ color: "#422ad5", fontSize: "24px", marginBottom: "10px" }}>
        Prayer Reminder
      </h1>

      <div style={{ backgroundColor: "#fafafa", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
        <h2 style={{ color: "#111827", fontSize: "20px", marginTop: "0" }}>
          {prayerTitle}
        </h2>

        {category && (
          <p style={{ color: "#838995", fontSize: "14px", marginBottom: "10px" }}>
            Category: {category}
          </p>
        )}

        {prayerDescription && (
          <p style={{ color: "#111827", fontSize: "16px", lineHeight: "1.5" }}>
            {prayerDescription}
          </p>
        )}
      </div>

      <p style={{ color: "#838995", fontSize: "14px", marginTop: "20px" }}>
        This is a reminder to pray for this request. May God hear and answer your prayers.
      </p>

      <p style={{ color: "#838995", fontSize: "12px", marginTop: "30px", borderTop: "1px solid #f3f4f6", paddingTop: "15px" }}>
        Sent from Prayerly - Your prayer and reminder app
      </p>
    </div>
  );
}
