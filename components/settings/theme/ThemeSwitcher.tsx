"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Circle, Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button className="btn btn-ghost btn-sm h-8 px-3">
          {theme === "light" ? (
            <Sun key="light" size={ICON_SIZE} className="text-text-graySecondary" />
          ) : theme === "dark" ? (
            <Moon key="dark" size={ICON_SIZE} className="text-text-graySecondary" />
          ) : (
            <Laptop key="system" size={ICON_SIZE} className="text-text-graySecondary" />
          )}
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className="z-50 min-w-[8rem] rounded-md border border-gray-200 bg-base-100 p-1 shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuPrimitive.RadioGroup
            value={theme}
            onValueChange={(e) => setTheme(e)}
          >
            <DropdownMenuPrimitive.RadioItem
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              value="light"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                  <Circle className="h-2 w-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
              <Sun size={ICON_SIZE} className="mr-2 text-text-graySecondary" />
              <span>Light</span>
            </DropdownMenuPrimitive.RadioItem>
            <DropdownMenuPrimitive.RadioItem
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              value="dark"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                  <Circle className="h-2 w-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
              <Moon size={ICON_SIZE} className="mr-2 text-text-graySecondary" />
              <span>Dark</span>
            </DropdownMenuPrimitive.RadioItem>
            <DropdownMenuPrimitive.RadioItem
              className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              value="system"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <DropdownMenuPrimitive.ItemIndicator>
                  <Circle className="h-2 w-2 fill-current" />
                </DropdownMenuPrimitive.ItemIndicator>
              </span>
              <Laptop size={ICON_SIZE} className="mr-2 text-text-graySecondary" />
              <span>System</span>
            </DropdownMenuPrimitive.RadioItem>
          </DropdownMenuPrimitive.RadioGroup>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

export { ThemeSwitcher };
