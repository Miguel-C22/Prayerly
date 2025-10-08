import * as React from "react";

interface Prayer {
  title: string;
  description: string;
  category: string;
}

interface PrayerReminderEmailProps {
  prayers: Prayer[];
}

export function PrayerReminderEmail({
  prayers,
}: PrayerReminderEmailProps) {
  const prayerCount = prayers.length;
  const title = prayerCount === 1
    ? "Prayer Reminder"
    : `${prayerCount} Prayer Reminders`;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "600px" }}>
      <h1 style={{ color: "#422ad5", fontSize: "24px", marginBottom: "10px" }}>
        {title}
      </h1>

      <p style={{ color: "#838995", fontSize: "14px", marginBottom: "20px" }}>
        {prayerCount === 1
          ? "You have a prayer reminder for today:"
          : `You have ${prayerCount} prayer reminders for today:`}
      </p>

      {prayers.map((prayer, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#fafafa",
            padding: "20px",
            borderRadius: "8px",
            marginTop: index === 0 ? "0" : "15px"
          }}
        >
          <h2 style={{ color: "#111827", fontSize: "20px", marginTop: "0" }}>
            {prayer.title}
          </h2>

          {prayer.category && (
            <p style={{ color: "#838995", fontSize: "14px", marginBottom: "10px" }}>
              Category: {prayer.category}
            </p>
          )}

          {prayer.description && (
            <p style={{ color: "#111827", fontSize: "16px", lineHeight: "1.5", marginBottom: "0" }}>
              {prayer.description}
            </p>
          )}
        </div>
      ))}

      <p style={{ color: "#838995", fontSize: "14px", marginTop: "20px" }}>
        {prayerCount === 1
          ? "This is a reminder to pray for this request. May God hear and answer your prayers."
          : "These are your prayer reminders for today. May God hear and answer your prayers."}
      </p>

      <p style={{ color: "#838995", fontSize: "12px", marginTop: "30px", borderTop: "1px solid #f3f4f6", paddingTop: "15px" }}>
        Sent from Prayerly - Your prayer and reminder app
      </p>
    </div>
  );
}
