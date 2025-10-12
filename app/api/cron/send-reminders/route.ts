import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { PrayerReminderEmail } from "@/components/emails/prayer-reminder-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify request has valid secret from cron-jobs.org
  const authHeader = request.headers.get("Authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to bypass RLS - cron job needs access to all users' reminders
  const supabase = createAdminClient();
  const now = new Date();

  try {
    // Get all reminders due now (regardless of channel)
    const { data: dueReminders, error } = await supabase
      .from("reminders")
      .select(`
        *,
        prayers (
          id,
          title,
          description,
          category
        )
      `)
      .lte("next_run_at", now.toISOString())
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching reminders:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!dueReminders || dueReminders.length === 0) {
      return Response.json({ sent: 0, message: "No reminders due" });
    }

    const results = [];

    // Process each reminder
    for (const reminder of dueReminders) {
      const channels = Array.isArray(reminder.channel)
        ? reminder.channel
        : [reminder.channel]; // Handle old data format

      // Send to each channel
      for (const channel of channels) {
        try {
          if (channel === 'email') {
            await sendEmailReminder(reminder);
            results.push({
              id: reminder.id,
              channel: 'email',
              status: "sent"
            });
          } else if (channel === 'push') {
            await sendPushReminder(reminder);
            results.push({
              id: reminder.id,
              channel: 'push',
              status: "sent"
            });
          }
        } catch (error) {
          console.error(`Failed to send ${channel} reminder:`, error);
          results.push({
            id: reminder.id,
            channel,
            status: "failed",
            error: String(error)
          });
        }
      }

      // Update next run time (once per reminder, not per channel)
      await updateNextRunTime(reminder, supabase);
    }

    return Response.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      total: dueReminders.length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

// Send email reminder for a single prayer
async function sendEmailReminder(reminder: any) {
  const email = reminder.destination?.email;
  if (!email) {
    throw new Error("No email address in destination");
  }

  const prayer = {
    title: reminder.prayers?.title || "Your Prayer",
    description: reminder.prayers?.description || "",
    category: reminder.prayers?.category || "",
  };

  const { data, error } = await resend.emails.send({
    from: "Prayerly <reminders@resend.dev>",
    to: email,
    subject: `Prayer Reminder: ${prayer.title}`,
    react: PrayerReminderEmail({ prayers: [prayer] }),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Log to reminder_logs
  const logSupabase = createAdminClient();
  await logSupabase.from("reminder_logs").insert({
    reminder_id: reminder.id,
    sent_at: new Date().toISOString(),
    channel: 'email',
    status: "sent",
    metadata: { resend_id: data?.id },
  });
}

// Send push notification via Webpushr REST API
async function sendPushReminder(reminder: any) {
  const subscriberId = reminder.destination?.push_subscriber_id;
  if (!subscriberId) {
    throw new Error("No push subscriber ID in destination");
  }

  const prayer = reminder.prayers || {};
  const title = `Prayer Reminder: ${prayer.title || 'Your Prayer'}`;
  const message = prayer.description || 'Time to pray for your request';

  // Call Webpushr REST API
  const response = await fetch('https://api.webpushr.com/v1/notification/send/sid', {
    method: 'POST',
    headers: {
      'webpushrKey': process.env.NEXT_PUBLIC_WEBPUSHR_PUBLIC_KEY!,
      'webpushrAuthToken': process.env.WEBPUSHR_AUTH_TOKEN!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      message,
      target_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/prayers`,
      sid: subscriberId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Webpushr API error: ${errorText}`);
  }

  // Log to reminder_logs
  const logSupabase = createAdminClient();
  await logSupabase.from("reminder_logs").insert({
    reminder_id: reminder.id,
    sent_at: new Date().toISOString(),
    channel: 'push',
    status: "sent",
    metadata: { subscriber_id: subscriberId },
  });
}

async function updateNextRunTime(reminder: any, supabase: any) {
  const nextRun = calculateNextRun(reminder);

  // Prepare update object
  const updateData: any = {
    last_run_at: new Date().toISOString(),
    next_run_at: nextRun?.toISOString() || null,
    updated_at: new Date().toISOString(),
  };

  // Only update occurrence_count if it exists (decrement)
  if (reminder.occurrence_count) {
    updateData.occurrence_count = reminder.occurrence_count - 1;
  }

  await supabase
    .from("reminders")
    .update(updateData)
    .eq("id", reminder.id);
}

function calculateNextRun(reminder: any): Date | null {
  const now = new Date();
  const currentRunTime = reminder.next_run_at
    ? new Date(reminder.next_run_at)
    : now;

  // Parse time_of_day (HH:MM:SS format)
  const [hours, minutes] = reminder.time_of_day
    ? reminder.time_of_day.split(":").map(Number)
    : [9, 0]; // Default to 9 AM

  switch (reminder.recurrence_type) {
    case "single":
      // One-time reminder, don't schedule next run
      return null;

    case "daily": {
      const nextRun = new Date(currentRunTime);
      nextRun.setDate(nextRun.getDate() + 1);
      nextRun.setHours(hours, minutes, 0, 0);
      return nextRun;
    }

    case "weekly": {
      const nextRun = new Date(currentRunTime);
      const daysOfWeek = reminder.days_of_week || [];

      if (daysOfWeek.length === 0) {
        // Default to same day next week
        nextRun.setDate(nextRun.getDate() + 7);
        nextRun.setHours(hours, minutes, 0, 0);
        return nextRun;
      }

      // Find next matching day of week
      let daysToAdd = 1;
      while (daysToAdd <= 7) {
        const testDate = new Date(currentRunTime);
        testDate.setDate(testDate.getDate() + daysToAdd);
        if (daysOfWeek.includes(testDate.getDay())) {
          testDate.setHours(hours, minutes, 0, 0);
          return testDate;
        }
        daysToAdd++;
      }
      return null;
    }

    case "custom_cron":
      // For custom cron, you'd need a cron parser library
      // Placeholder for now
      console.warn("Custom cron not yet implemented");
      return null;

    default:
      return null;
  }
}
