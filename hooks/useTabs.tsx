import React, { useState, useEffect } from "react";

interface UseTabsProps {
  tab: string;
  amount: number;
}

function useTabs(tabs: UseTabsProps[]) {
  const [selectedTab, setSelectedTab] = useState<string>("");

  useEffect(() => {
    if (tabs.length > 0) {
      setSelectedTab(tabs[0].tab);
    }
  }, []);

  const displayTabs = () => {
    return (
      <div className="flex w-full rounded-full bg-backgrounds-grayLight px-2 py-1 font-bold text-sm">
        {tabs.map((tab) => (
          <a
            key={tab.tab}
            className={`w-full py-1 transition-all text-center cursor-pointer ${
              selectedTab === tab.tab
                ? "bg-backgrounds-white rounded-full text-text-grayPrimary shadow-sm "
                : "text-text-graySecondary hover:text-text-grayPrimary"
            }`}
            onClick={() => setSelectedTab(tab.tab)}
          >
            {tab.tab} ({tab.amount})
          </a>
        ))}
      </div>
    );
  };

  return { displayTabs, selectedTab };
}

export default useTabs;
