"use client";

import React, { useState, useEffect } from "react";
import { dockTabs } from "./dockTabs";
import { HeaderContent } from "../header/Header";
import {
  homeContent,
  journalContent,
  remindersContent,
  profileContent,
} from "../header/headerContent";
import { useRouter, usePathname } from "next/navigation";
import Icon from "@/components/icon/Icon";

interface DockProps {
  setHeaderContent: React.Dispatch<React.SetStateAction<HeaderContent>>;
}

function Dock({ setHeaderContent }: DockProps) {
  const router = useRouter();
  const pathname = usePathname();

  const getTabFromPath = (path: string) => {
    const pathName = path.slice(1);
    return pathName.charAt(0).toUpperCase() + pathName.slice(1);
  };

  const [activeTab, setActiveTab] = useState(() => getTabFromPath(pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(pathname));
  }, [pathname]);

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);

    let content: HeaderContent = {};
    let route = "/";

    switch (tabName) {
      case "Home":
        content = homeContent;
        route = "/home";
        break;
      case "Journal":
        content = journalContent;
        route = "/journal";
        break;
      case "Reminders":
        content = remindersContent;
        route = "/reminders";
        break;
      case "Profile":
        content = profileContent;
        route = "/profile";
        break;
    }

    setHeaderContent(content);
    router.push(route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-0 bg-backgrounds-white border-t border-border-gray">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {dockTabs.map((tab) => (
          <button
            key={tab.name}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg ${
              activeTab === tab.name
                ? "bg-backgrounds-lavender"
                : "hover:bg-backgrounds-grayLight"
            }`}
            onClick={() => handleTabClick(tab.name)}
          >
            <Icon
              icon={tab.icon}
              className={`w-6 h-6 ${
                activeTab === tab.name
                  ? "text-text-purplePrimary"
                  : "text-text-grayPrimary"
              }`}
            />
            <span
              className={`text-xs font-medium ${
                activeTab === tab.name
                  ? "text-text-purplePrimary"
                  : "text-text-grayPrimary"
              }`}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dock;
