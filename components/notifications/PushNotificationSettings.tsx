"use client";

import { useState, useEffect } from "react";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webpushr?: ((command: string, ...args: any[]) => void) & { q?: any[] };
  }
}

export default function PushNotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if browser supports notifications
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds

      // Wait for Webpushr SDK stub to load
      const checkWebpushr = setInterval(() => {
        attempts++;

        if (typeof window.webpushr !== "undefined") {
          // SDK stub exists, that's all we need to show the UI
          clearInterval(checkWebpushr);
          setIsLoading(false);
        } else if (attempts >= maxAttempts) {
          // Timeout - SDK failed to load
          clearInterval(checkWebpushr);
          setIsLoading(false);
          setError(
            "Push notification service failed to load. Please refresh the page."
          );
        }
      }, 100);

      return () => clearInterval(checkWebpushr);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSubscribe = async () => {
    if (typeof window.webpushr === "undefined") {
      setError(
        "Push notification service is not ready. Please refresh the page."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    // Retry logic: SDK might not be fully ready yet
    const attemptSubscribe = (attempt: number) => {
      if (typeof window.webpushr === "undefined") {
        setError("Push notification service is not available.");
        setIsLoading(false);
        return;
      }

      try {
        window.webpushr("is_setup_done", (isSetup: boolean) => {
          if (isSetup && typeof window.webpushr !== "undefined") {
            // SDK is ready, subscribe
            window.webpushr("subscribe", (sid: string) => {
              if (sid) {
                setIsSubscribed(true);
                saveSubscriberId(sid);
              } else {
                setError("Failed to subscribe. Please try again.");
              }
              setIsLoading(false);
            });
          } else if (attempt < 5) {
            // Not ready yet, retry after 500ms (max 5 attempts = 2.5 seconds)
            setTimeout(() => attemptSubscribe(attempt + 1), 500);
          } else {
            // Give up after 5 attempts
            setError("Push notification service is taking too long to initialize. Please refresh and try again.");
            setIsLoading(false);
          }
        });
      } catch (error) {
        // If error occurs and we have retries left, try again
        if (attempt < 5) {
          setTimeout(() => attemptSubscribe(attempt + 1), 500);
        } else {
          console.error("Failed to subscribe:", error);
          setError("Failed to subscribe. Please refresh the page and try again.");
          setIsLoading(false);
        }
      }
    };

    attemptSubscribe(1);
  };

  const handleUnsubscribe = async () => {
    if (typeof window.webpushr === "undefined") {
      setError(
        "Push notification service is not ready. Please refresh the page."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Check if SDK is fully initialized
      window.webpushr("is_setup_done", (isSetup: boolean) => {
        if (!isSetup) {
          setError(
            "Push notification service is still initializing. Please wait a moment and try again."
          );
          setIsLoading(false);
          return;
        }

        // SDK is ready, now unsubscribe
        if (typeof window.webpushr !== "undefined") {
          window.webpushr("unsubscribe");
        }
        setIsSubscribed(false);
        saveSubscriberId(null);
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
      setError("Failed to unsubscribe. Please try again.");
      setIsLoading(false);
    }
  };

  const saveSubscriberId = async (sid: string | null) => {
    try {
      const response = await fetch("/api/user/push-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriberId: sid }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription");
      }
    } catch (error) {
      console.error("Error saving subscriber ID:", error);
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
