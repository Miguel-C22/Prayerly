import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { PrayerReminderEmail } from "@/components/emails/prayer-reminder-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  // Verify cron secret for security
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

    const results = [];

    // Send each reminder
    for (const reminder of dueReminders) {
      try {
        await sendReminderEmail(reminder);
        await updateNextRunTime(reminder, supabase);
        results.push({ id: reminder.id, status: "sent" });
      } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
        results.push({ id: reminder.id, status: "failed", error: String(error) });
      }
    }

    return Response.json({
      sent: results.filter((r) => r.status === "sent").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return Response.json({ error: String(error) }, { status: 500 });
  }
}

async function sendReminderEmail(reminder: any) {
  const email = reminder.destination?.email;

  if (!email) {
    throw new Error("No email address in reminder destination");
  }

  const { data, error } = await resend.emails.send({
    from: "Prayerly <reminders@resend.dev>",
    to: email,
    subject: `Prayer Reminder: ${reminder.prayers?.title || "Your Prayer"}`,
    react: PrayerReminderEmail({
      prayerTitle: reminder.prayers?.title || "Your Prayer",
      prayerDescription: reminder.prayers?.description || "",
      category: reminder.prayers?.category || "",
    }),
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }

  // Log the send to reminder_logs table
  const supabase = await createClient();
  await supabase.from("reminder_logs").insert({
    reminder_id: reminder.id,
    sent_at: new Date().toISOString(),
    status: "sent",
    metadata: { resend_id: data?.id },
  });
}

async function updateNextRunTime(reminder: any, supabase: any) {
  const nextRun = calculateNextRun(reminder);

  // Check if we've reached the end
  const shouldDeactivate =
    !nextRun ||
    (reminder.end_date && nextRun > new Date(reminder.end_date)) ||
    (reminder.occurrence_count && reminder.occurrence_count <= 1);

  await supabase
    .from("reminders")
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: nextRun?.toISOString() || null,
      is_active: !shouldDeactivate,
      occurrence_count: reminder.occurrence_count
        ? reminder.occurrence_count - 1
        : null,
      updated_at: new Date().toISOString(),
    })
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
