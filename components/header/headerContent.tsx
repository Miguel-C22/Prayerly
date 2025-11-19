import React from "react";
import { HeaderContent } from "./Header";
import Button from "@/components/ui/button/Button";

export const homeContent: HeaderContent = {
  title: "Prayer Requests",
  subtitle: "Your conversations with God",
  customButton: () => (
    <Button
      onClick={() => {
        const checkbox = document.getElementById("add-prayer") as HTMLInputElement;
        if (checkbox) checkbox.checked = true;
      }}
      icon={<span>+</span>}
      iconPosition="left"
    >
      Add Prayer
    </Button>
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
