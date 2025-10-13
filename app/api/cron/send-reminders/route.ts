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

    // Group reminders by user_id and channel for batching
    const grouped = new Map<string, Map<string, any[]>>();

    for (const reminder of dueReminders) {
      const userId = reminder.user_id;
      const channels = Array.isArray(reminder.channel)
        ? reminder.channel
        : [reminder.channel];

      if (!grouped.has(userId)) {
        grouped.set(userId, new Map());
      }

      const userChannels = grouped.get(userId)!;

      for (const channel of channels) {
        if (!userChannels.has(channel)) {
          userChannels.set(channel, []);
        }
        userChannels.get(channel)!.push(reminder);
      }
    }

    const results = [];

    // Send batched notifications for each user + channel combination
    for (const [userId, channels] of grouped.entries()) {
      for (const [channel, reminders] of channels.entries()) {
        try {
          if (channel === 'email') {
            await sendBatchedEmailReminder(reminders);
            results.push({
              user_id: userId,
              channel: 'email',
              count: reminders.length,
              status: "sent"
            });
          } else if (channel === 'push') {
            await sendBatchedPushReminder(reminders);
            results.push({
              user_id: userId,
              channel: 'push',
              count: reminders.length,
              status: "sent"
            });
          }
        } catch (error) {
          console.error(`Failed to send ${channel} reminder for user ${userId}:`, error);
          results.push({
            user_id: userId,
            channel,
            count: reminders.length,
            status: "failed",
            error: String(error)
          });
        }
      }
    }

    // Update next run time for all reminders
    for (const reminder of dueReminders) {
      await updateNextRunTime(reminder, supabase);
    }

    return Response.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      totalReminders: dueReminders.length,
      totalNotifications: results.length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

// Send batched email reminder for multiple prayers
async function sendBatchedEmailReminder(reminders: any[]) {
  if (reminders.length === 0) return;

  const email = reminders[0].destination?.email;
  if (!email) {
    throw new Error("No email address in destination");
  }

  // Collect all prayers
  const prayers = reminders.map(reminder => ({
    title: reminder.prayers?.title || "Your Prayer",
    description: reminder.prayers?.description || "",
    category: reminder.prayers?.category || "",
  }));

  // Send one email with all prayers
  const subject = prayers.length === 1
    ? `Prayer Reminder: ${prayers[0].title}`
    : `Prayer Reminders: ${prayers.length} prayers`;

  const { data, error } = await resend.emails.send({
    from: "Prayerly <reminders@resend.dev>",
    to: email,
    subject,
    react: PrayerReminderEmail({ prayers }),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Log to reminder_logs for each reminder
  const logSupabase = createAdminClient();
  for (const reminder of reminders) {
    await logSupabase.from("reminder_logs").insert({
      reminder_id: reminder.id,
      sent_at: new Date().toISOString(),
      channel: 'email',
      status: "sent",
      metadata: { resend_id: data?.id, batched: true, batch_size: reminders.length },
    });
  }
}

// Send batched push notification for multiple prayers to all user devices
async function sendBatchedPushReminder(reminders: any[]) {
  if (reminders.length === 0) return;

  const userId = reminders[0].user_id;
  if (!userId) {
    throw new Error("No user ID in reminder");
  }

  // Get all push subscriptions for this user
  const supabase = createAdminClient();
  const { data: subscriptions, error: subError } = await supabase
    .from("push_subscriptions")
    .select("subscriber_id")
    .eq("user_id", userId);

  if (subError || !subscriptions || subscriptions.length === 0) {
    throw new Error("No push subscriptions found for user");
  }

  // Format message based on number of prayers
  let title: string;
  let message: string;

  if (reminders.length === 1) {
    const prayer = reminders[0].prayers || {};
    title = `Prayer Reminder: ${prayer.title || 'Your Prayer'}`;
    message = prayer.description || 'Time to pray for your request';
  } else {
    title = `Prayer Reminders: ${reminders.length} prayers`;
    const prayerTitles = reminders
      .slice(0, 3)
      .map(r => r.prayers?.title || 'Prayer')
      .join(', ');
    message = reminders.length > 3
      ? `${prayerTitles}, and ${reminders.length - 3} more...`
      : prayerTitles;
  }

  // Send to ALL user devices using OneSignal
  // OneSignal allows up to 2000 player_ids per request
  const playerIds = subscriptions.map(sub => sub.subscriber_id);

  try {
    // Call OneSignal REST API to send notification
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        app_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        url: 'https://prayerly-livid.vercel.app/prayers',
        // Optional: Add custom data
        data: {
          prayer_count: reminders.length,
          type: 'prayer_reminder',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OneSignal API error:`, errorText);
      throw new Error(`OneSignal API error: ${errorText}`);
    }

    const responseData = await response.json();
    console.log(`OneSignal notification sent. ID: ${responseData.id}, Recipients: ${responseData.recipients}`);
  } catch (error) {
    console.error(`Failed to send push notification:`, error);
    throw error; // Re-throw to mark as failed in results
  }

  // Log to reminder_logs for each reminder (one log entry per reminder, not per device)
  const logSupabase = createAdminClient();
  for (const reminder of reminders) {
    await logSupabase.from("reminder_logs").insert({
      reminder_id: reminder.id,
      sent_at: new Date().toISOString(),
      channel: 'push',
      status: "sent",
      metadata: {
        batched: true,
        batch_size: reminders.length,
        devices_sent: subscriptions.length,
      },
    });
  }
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
