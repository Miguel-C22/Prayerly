import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { PrayerReminderEmail } from "@/components/emails/prayer-reminder-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify request has valid secret from cron-jobs.org
  const authHeader = request.headers.get("Authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();

  try {
    // Get all reminders due now
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
      .eq("is_active", true)
      .eq("channel", "email");

    if (error) {
      console.error("Error fetching reminders:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!dueReminders || dueReminders.length === 0) {
      return Response.json({ sent: 0, message: "No reminders due" });
    }

    // Group reminders by user email
    const remindersByEmail = new Map<string, any[]>();

    for (const reminder of dueReminders) {
      const email = reminder.destination?.email;
      if (!email) continue;

      if (!remindersByEmail.has(email)) {
        remindersByEmail.set(email, []);
      }
      remindersByEmail.get(email)!.push(reminder);
    }

    const results = [];

    // Send one email per user with all their due prayers
    for (const [email, reminders] of remindersByEmail.entries()) {
      try {
        await sendBatchReminderEmail(email, reminders);

        // Update all reminders in this batch
        for (const reminder of reminders) {
          await updateNextRunTime(reminder, supabase);
          results.push({ id: reminder.id, status: "sent" });
        }
      } catch (error) {
        console.error(`Failed to send batch of ${reminders.length} reminders:`, error);
        for (const reminder of reminders) {
          results.push({ id: reminder.id, status: "failed", error: String(error) });
        }
      }
    }

    return Response.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      emailsSent: remindersByEmail.size,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

async function sendBatchReminderEmail(email: string, reminders: any[]) {
  if (!email) {
    throw new Error("No email address provided");
  }

  // Extract prayer data from reminders
  const prayers = reminders.map((reminder) => ({
    title: reminder.prayers?.title || "Your Prayer",
    description: reminder.prayers?.description || "",
    category: reminder.prayers?.category || "",
  }));

  // Create subject line
  const subject =
    prayers.length === 1
      ? `Prayer Reminder: ${prayers[0].title}`
      : `${prayers.length} Prayer Reminders for Today`;

  const { data, error } = await resend.emails.send({
    from: "Prayerly <reminders@resend.dev>",
    to: email,
    subject,
    react: PrayerReminderEmail({ prayers }),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Log the send to reminder_logs table for each reminder
  const supabase = await createClient();
  const logPromises = reminders.map((reminder) =>
    supabase.from("reminder_logs").insert({
      reminder_id: reminder.id,
      sent_at: new Date().toISOString(),
      status: "sent",
      metadata: { resend_id: data?.id, batch_size: reminders.length },
    })
  );

  await Promise.all(logPromises);
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
