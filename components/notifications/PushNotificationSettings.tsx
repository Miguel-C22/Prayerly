"use client";

import { useState, useEffect } from "react";

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure we're fully mounted on client before checking service workers
    let mounted = true;

    const init = async () => {
      // Check if browser supports notifications and service workers
      if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
        setIsSupported(true);

        // Small delay to ensure hydration is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        if (mounted) {
          await checkSubscriptionStatus();
        }
      } else {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      setIsLoading(false);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setError("Notification permission denied. Please enable notifications in your browser settings.");
        setIsLoading(false);
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register("/webpushr-sw.js");
      await navigator.serviceWorker.ready;

      // Subscribe to push notifications with VAPID key
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });

      // Send subscription to our backend
      const response = await fetch("/api/user/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to register subscription");
      }

      setIsSubscribed(true);
      setIsLoading(false);
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
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notify backend
      await fetch("/api/user/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: null }),
      });

      setIsSubscribed(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      setError("Failed to unsubscribe. Please try again.");
      setIsLoading(false);
    }
  };

  // Helper function to convert VAPID key
  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (!isSupported) {
    return (
      <div className="text-sm text-text-graySecondary">
        Push notifications are not supported in your browser. Please use Chrome,
        Firefox, Edge, or Safari 16+.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-sm text-text-graySecondary flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-text-purplePrimary border-t-transparent rounded-full animate-spin"></div>
        Loading push notification service...
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
