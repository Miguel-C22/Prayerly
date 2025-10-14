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

  useEffect(() => {
    // Check browser support
    if (!("Notification" in window && "serviceWorker" in navigator && "PushManager" in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Check subscription status from Supabase (much faster than polling OneSignal)
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/user/push-subscription-status");
        if (response.ok) {
          const data = await response.json();
          setIsSubscribed(data.isSubscribed);
          console.log("Push subscription status from database:", data.isSubscribed);
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
      }
    };

    checkSubscription();
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

          // Wait for subscription to complete and get ID
          // Poll for up to 10 seconds
          let subscriberId = null;
          let attempts = 0;
          const maxAttempts = 20; // 10 seconds (20 * 500ms)

          while (!subscriberId && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            subscriberId = await OneSignal.User.PushSubscription.id;
            attempts++;

            if (subscriberId) {
              console.log("Got OneSignal subscriber ID:", subscriberId);
              break;
            }
          }

          if (!subscriberId) {
            throw new Error("Failed to get subscription ID from OneSignal. Please try again.");
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
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to save subscription");
          }

          console.log("Successfully subscribed to push notifications");
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
          console.log("Unsubscribing OneSignal player:", subscriberId);

          if (!subscriberId) {
            console.warn("No subscriber ID found, might already be unsubscribed");
          }

          // Unsubscribe from OneSignal
          await OneSignal.User.PushSubscription.optOut();
          console.log("OneSignal optOut successful");

          // Notify backend to remove from database
          const response = await fetch("/api/user/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscription: null,
              subscriberId: subscriberId
            }),
          });

          if (!response.ok) {
            console.error("Backend unsubscribe failed:", await response.text());
          } else {
            console.log("Successfully unsubscribed from database");
          }

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
