"use server";

import { bulkDeleteReflections } from "@/utils/server/reflectionBulkOperations";
import { revalidatePath } from "next/cache";

export async function deleteReflectionsAction(reflectionIds: string[]) {
  const result = await bulkDeleteReflections(reflectionIds);

  if (result.success) {
    revalidatePath("/journal");
  }

  return result;
}
