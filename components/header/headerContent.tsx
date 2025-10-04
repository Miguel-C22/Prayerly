import React from "react";
import { HeaderContent } from "./Header";

export const homeContent: HeaderContent = {
  title: "Prayer Requests",
  subtitle: "Your conversations with God",
  customButton: () => (
    <label
      htmlFor="add-prayer"
      className="btn btn-primary  px-3 flex items-center gap-4"
    >
      <span>+</span>
      Add Prayer
    </label>
  ),
};

export const journalContent: HeaderContent = {
  title: "Journal",
  subtitle: "Your reflections and God's faithfulness",
  customButton: () => null,
};

export const remindersContent: HeaderContent = {
  title: "Reminders",
  subtitle: "Stay on top of your prayer schedule",
  customButton: () => null,
};

export const profileContent: HeaderContent = {
  title: "Profile",
  subtitle: "Your prayer journey",
  customButton: () => null,
};
