/**
 * Shared card styles using DaisyUI card classes and custom theme colors
 * All styles automatically respond to theme changes via CSS variables
 */

export const cardStyles = {
  /**
   * Base card style - Used for standard content cards
   * (ContentCard, ReminderCard)
   */
  base: "card bg-backgrounds-grayLight border border-border-gray shadow-md relative before:absolute before:inset-0 before:bg-white/5 before:rounded-lg before:pointer-events-none",

  /**
   * Settings card style - Used for larger, more prominent cards
   * (SettingsCard, ProfileCard)
   */
  settings:
    "card bg-backgrounds-grayLight shadow-lg border border-border-gray rounded-3xl",

  /**
   * Stat card style - Used for statistics/metrics display
   * (StatCard)
   */
  stat: "card bg-backgrounds-veryLight shadow-sm border border-border-gray rounded-2xl  relative before:absolute before:inset-0 before:bg-white/5 before:rounded-lg before:pointer-events-none",
};
