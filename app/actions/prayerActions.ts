"use server";

import {
  bulkDeletePrayers,
  bulkArchivePrayers,
  bulkMarkAsAnswered,
} from "@/utils/server/bulkOperations";
import { revalidatePath } from "next/cache";

export async function deletePrayersAction(prayerIds: string[]) {
  const result = await bulkDeletePrayers(prayerIds);

  if (result.success) {
    revalidatePath("/home");
    revalidatePath("/journal");
  }

  return result;
}

export async function archivePrayersAction(prayerIds: string[]) {
  const result = await bulkArchivePrayers(prayerIds);

  if (result.success) {
    revalidatePath("/home");
    revalidatePath("/journal");
  }

  return result;
}

export async function markPrayersAsAnsweredAction(prayerIds: string[]) {
  const result = await bulkMarkAsAnswered(prayerIds);

  if (result.success) {
    revalidatePath("/home");
    revalidatePath("/journal");
  }

  return result;
}
