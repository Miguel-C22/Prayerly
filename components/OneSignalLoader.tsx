"use client";

import { useEffect } from "react";

// Extend window type for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: any[];
  }
}

export default function OneSignalLoader() {
  useEffect(() => {
    // Only load if not already loaded
    if (typeof window !== "undefined" && !window.OneSignalDeferred) {
      // Load OneSignal SDK script
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      document.head.appendChild(script);

      // Initialize OneSignal
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          serviceWorkerParam: { scope: "/" },
          allowLocalhostAsSecureOrigin: true,
        });
      });
    }
  }, []);

  return null; // This component doesn't render anything
}
