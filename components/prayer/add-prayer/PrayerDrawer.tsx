import React from "react";
import PrayerForm from "./PrayerForm";
import Icon from "@/components/ui/icon/Icon";

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
            <div className="flex justify-between items-center mb-4">
              <label
                htmlFor="add-prayer"
                className="font-semibold !rounded-full transition-all duration-200 focus:outline-none focus:outline-offset-0 inline-flex items-center justify-center gap-2 border-2 bg-transparent hover:bg-backgrounds-grayLight text-text-grayPrimary border-transparent h-10 px-4 text-sm cursor-pointer"
              >
                <Icon icon="backArrow" className="w-5 h-5" />
                Back
              </label>
            </div>
          </div>

          {/* Centered form content */}
          <div className="flex-1 flex items-center justify-center p-6 pt-2">
            <div className="w-full max-w-3xl bg-backgrounds-white border border-border-gray rounded-xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-text-grayPrimary mb-2 flex gap-4 items-center">
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
