import React from "react";
import PrayerForm from "./PrayerForm";
import Icon from "@/components/icon/Icon";

interface PrayerRequestDrawerProps {
  onPrayerSubmitted?: (prayerData: any, response: any) => void;
}

function PrayerRequestDrawer({ onPrayerSubmitted }: PrayerRequestDrawerProps) {
  return (
    <div className="drawer z-40">
      <input id="add-prayer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label
          htmlFor="add-prayer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <div className="text-base-content min-h-full w-full flex flex-col bg-backgrounds-light">
          {/* Header with back button */}
          <div className="flex-none p-6 pb-0">
            <div className="flex justify-between items-center mb-4 text-black">
              <label
                htmlFor="add-prayer"
                className="btn btn-ghost text-black flex items-center gap-2 hover:bg-transparent hover:shadow-none hover:scale-100 hover:border-transparent focus:border-transparent focus:outline-none"
              >
                <Icon icon="backArrow" className="w-5 h-5" />
                Back
              </label>
            </div>
          </div>

          {/* Centered form content */}
          <div className="flex-1 flex items-center justify-center p-6 pt-2">
            <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex gap-4 items-center">
                  <Icon
                    icon="heart"
                    className="w-6 h-6 text-text-purplePrimary"
                  />
                  Your Prayer
                </h2>
              </div>
              <PrayerForm onPrayerSubmitted={onPrayerSubmitted} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrayerRequestDrawer;
