export function filterReflections(
  initialReflections: any[] | undefined,
  prayer: any
) {
  if (!initialReflections) return [];

  return initialReflections
    .filter((reflection) => reflection.prayer_id === prayer.id)
    .map((reflection) => ({
      id: prayer.id,
      reflection_id: reflection.id,
      title: prayer.title,
      created_at: reflection.created_at,
      category: prayer.category,
      reflection: reflection.note || "",
    }));
}
