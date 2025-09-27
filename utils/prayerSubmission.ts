import axios from "axios";

interface PrayerSubmission {
  title: string;
  description: string;
  category: string;
  recurrenceType: string;
}

async function prayerSubmission({
  title,
  description,
  category,
  recurrenceType,
}: PrayerSubmission) {
  try {
    const { data } = await axios.post(
      "/api/prayers",
      {
        title,
        description,
        category,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (recurrenceType && data.prayer.id) {
      await axios.post(
        "/api/reminders",
        {
          prayer_id: data.prayer.id,
          recurrence_type: recurrenceType,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    return data;
  } catch (error) {
    console.error("Error submitting prayer:", error);
    throw error;
  }
}

export default prayerSubmission;
