"use client";

import React, { useState, useEffect } from "react";
import Dock from "@/components/dock/Dock";
import Header, { HeaderContent } from "@/components/header/Header";
import {
  homeContent,
  journalContent,
  remindersContent,
  profileContent
} from "@/components/header/headerContent";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const getHeaderContentFromPath = (path: string): HeaderContent => {
    switch (path) {
      case "/home":
        return homeContent;
      case "/journal":
        return journalContent;
      case "/reminders":
        return remindersContent;
      case "/profile":
        return profileContent;
      default:
        return homeContent;
    }
  };

  const [headerContent, setHeaderContent] = useState<HeaderContent>(() =>
    getHeaderContentFromPath(pathname)
  );

  useEffect(() => {
    setHeaderContent(getHeaderContentFromPath(pathname));
  }, [pathname]);

  return (
    <div className="min-h-screen bg-white bg-backgrounds-veryLight">
      <Header headerContent={headerContent} />

      <main className="pb-20 flex justify-center">
        <div className="w-full mx-8 md:w-full lg:w-full 2xl:w-3/4 lg:px-0">
          {children}
        </div>
      </main>

      <Dock setHeaderContent={setHeaderContent} />
    </div>
  );
}
