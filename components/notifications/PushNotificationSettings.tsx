"use client";

import { useState, useEffect } from "react";
import { usePushNotification } from "@/contexts/PushNotificationContext";

// Extend window type for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const {
    isSubscribed,
    setIsSubscribed,
    isLoading: isCheckingStatus,
  } = usePushNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    // Check browser support
    if (
      !(
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
      )
    ) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Check notification permission status
    if ("Notification" in window) {
      setPermissionState(Notification.permission);
    }
    // Note: Subscription status check is now handled by PushNotificationContext
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
          // Check current state before subscribing
          const beforeState = {
            optedIn: await OneSignal.User.PushSubscription.optedIn,
            id: await OneSignal.User.PushSubscription.id,
            token: await OneSignal.User.PushSubscription.token,
          };

          // If already has an ID (previously subscribed), opt back in instead of creating new
          if (beforeState.id) {
            await OneSignal.User.PushSubscription.optIn();
          } else {
            // Request permission and subscribe (new user)
            await OneSignal.Slidedown.promptPush();
          }

          // Wait for subscription to complete and get ID
          // Poll for up to 10 seconds
          let subscriberId = null;
          let token = null;
          let attempts = 0;
          const maxAttempts = 20; // 10 seconds (20 * 500ms)

          while ((!subscriberId || !token) && attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            subscriberId = await OneSignal.User.PushSubscription.id;
            token = await OneSignal.User.PushSubscription.token;
            attempts++;

            if (subscriberId && token) {
              break;
            }
          }

          if (!subscriberId) {
            throw new Error(
              "Failed to get subscription ID from OneSignal. Please try again."
            );
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

          setIsSubscribed(true);
          setIsLoading(false);
        } catch (error) {
          console.error("OneSignal subscription error:", error);
          setError(
            error instanceof Error ? error.message : "Failed to subscribe"
          );
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to subscribe. Please try again."
      );
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

          // Properly unsubscribe from OneSignal
          await OneSignal.User.PushSubscription.optOut();

          // Also unregister the service worker to fully clean up
          const registrations =
            await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.active?.scriptURL.includes("OneSignal")) {
              await registration.unregister();
            }
          }

          // Notify backend to remove from database
          const response = await fetch("/api/user/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscription: null,
              subscriberId: subscriberId,
            }),
          });

          if (!response.ok) {
            console.error("Failed to unsubscribe:", await response.text());
          }

          // Clear local state
          try {
            // Clear OneSignal specific storage
            Object.keys(localStorage).forEach((key) => {
              if (key.includes("OneSignal") || key.includes("onesignal")) {
                localStorage.removeItem(key);
              }
            });
            Object.keys(sessionStorage).forEach((key) => {
              if (key.includes("OneSignal") || key.includes("onesignal")) {
                sessionStorage.removeItem(key);
              }
            });
          } catch {
            // Silently fail if can't clear storage
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

  if (isCheckingStatus) {
    return (
      <div className="text-sm text-text-graySecondary">
        Checking subscription status...
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

      {permissionState === "denied" && (
        <div className="text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
          <p className="font-semibold mb-1">Notifications Blocked</p>
          <p className="text-xs">
            You previously blocked notifications for this site. To enable them:
          </p>
          <ul className="text-xs mt-2 ml-4 list-disc space-y-1">
            <li>
              <strong>Safari:</strong> Settings → Safari → Website Settings →
              Notifications → Allow
            </li>
            <li>
              <strong>Chrome:</strong> Click lock icon in address bar → Site
              settings → Notifications → Allow
            </li>
          </ul>
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
