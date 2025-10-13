"use client";

import { useState, useEffect } from "react";

// Extend window type for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Set to false immediately to avoid hydration issues
    setIsChecking(false);

    // Check browser support
    if (!("Notification" in window && "serviceWorker" in navigator && "PushManager" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Check OneSignal subscription status after component mounts
    const checkSubscription = async () => {
      try {
        if (!window.OneSignalDeferred) {
          return;
        }

        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            const isPushEnabled = await OneSignal.User.PushSubscription.optedIn;
            setIsSubscribed(isPushEnabled);
          } catch (error) {
            console.error("Error checking subscription status:", error);
          }
        });
      } catch (error) {
        console.error("Error checking OneSignal subscription:", error);
      }
    };

    // Wait for OneSignal to load
    const timer = setTimeout(checkSubscription, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.OneSignalDeferred) {
        throw new Error("OneSignal not loaded. Please refresh the page.");
      }

      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          // Request permission and subscribe
          await OneSignal.Slidedown.promptPush();

          // Get the subscription ID (player ID)
          const subscriberId = await OneSignal.User.PushSubscription.id;

          if (!subscriberId) {
            throw new Error("Failed to get subscription ID");
          }

          // Send to our backend to save in database
          const response = await fetch("/api/user/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscriberId: subscriberId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save subscription");
          }

          setIsSubscribed(true);
          setIsLoading(false);
        } catch (error) {
          console.error("OneSignal subscription error:", error);
          setError(error instanceof Error ? error.message : "Failed to subscribe");
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError(error instanceof Error ? error.message : "Failed to subscribe. Please try again.");
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!window.OneSignalDeferred) {
        throw new Error("OneSignal not loaded");
      }

      window.OneSignalDeferred.push(async (OneSignal: any) => {
        try {
          // Get subscriber ID before unsubscribing
          const subscriberId = await OneSignal.User.PushSubscription.id;

          // Unsubscribe from OneSignal
          await OneSignal.User.PushSubscription.optOut();

          // Notify backend
          await fetch("/api/user/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscription: null,
              subscriberId: subscriberId
            }),
          });

          setIsSubscribed(false);
          setIsLoading(false);
        } catch (error) {
          console.error("OneSignal unsubscribe error:", error);
          setError("Failed to unsubscribe");
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      setError("Failed to unsubscribe. Please try again.");
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-text-graySecondary">
        Push notifications are not supported in your browser. Please use Chrome,
        Firefox, Edge, or Safari 16+.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          {error}
        </div>
      )}

      {isSubscribed ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
              Push notifications enabled
            </p>
          </div>
          <button
            onClick={handleUnsubscribe}
            disabled={isLoading}
            className="px-4 py-2 text-sm border border-text-grayTertiary rounded-lg hover:bg-backgrounds-grayHover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Disabling..." : "Disable Push Notifications"}
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-text-graySecondary">
            Enable push notifications to get prayer reminders directly in your
            browser, even when the app is closed.
          </p>
          <button
            onClick={handleSubscribe}
            disabled={isLoading}
            className="px-4 py-2 text-sm bg-backgrounds-purplePrimary text-white rounded-lg hover:bg-backgrounds-purpleSecondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enabling..." : "Enable Push Notifications"}
          </button>
        </>
      )}
    </div>
  );
}
