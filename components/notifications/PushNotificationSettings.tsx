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
    // Check if we're on localhost - Webpushr only works on production domain
    const isLocalhost = typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
       window.location.hostname === "127.0.0.1" ||
       window.location.hostname.includes("localhost"));

    if (isLocalhost) {
      setIsLoading(false);
      setError(
        "Push notifications are only available on the production site (https://prayerly-livid.vercel.app). They cannot be tested on localhost."
      );
      return;
    }

    // Check if browser supports notifications
    if ("Notification" in window && "serviceWorker" in navigator) {
      setIsSupported(true);
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds
      let isInitialized = false;

      // Wait for Webpushr SDK to fully initialize
      const checkWebpushr = setInterval(() => {
        attempts++;

        if (typeof window.webpushr !== "undefined" && !isInitialized) {
          // SDK stub exists, now check if it's fully initialized
          try {
            window.webpushr("is_setup_done", (isSetup: boolean) => {
              if (isSetup && !isInitialized) {
                isInitialized = true;
                clearInterval(checkWebpushr);
                setIsLoading(false);
                checkSubscriptionStatus();
              }
            });
          } catch (err) {
            // If there's an error, stop trying and show error message
            console.error("Webpushr initialization error:", err);
            isInitialized = true;
            clearInterval(checkWebpushr);
            setIsLoading(false);
            setError("Failed to initialize push notifications. Please refresh the page.");
          }
        }

        if (attempts >= maxAttempts && !isInitialized) {
          isInitialized = true;
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

  const checkSubscriptionStatus = () => {
    if (typeof window.webpushr === "undefined") {
      return;
    }

    try {
      // Check if SDK is fully initialized
      window.webpushr("is_setup_done", (isSetup: boolean) => {
        if (isSetup && typeof window.webpushr !== "undefined") {
          window.webpushr("fetch_id", (sid: string) => {
            if (sid) {
              setIsSubscribed(true);
              saveSubscriberId(sid);
            }
          });
        }
      });
    } catch (err) {
      console.error("Error checking subscription status:", err);
    }
  };

  const handleSubscribe = async () => {
    if (typeof window.webpushr === "undefined") {
      setError(
        "Push notification service is not ready. Please refresh the page."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // First check if SDK is fully initialized
      window.webpushr("is_setup_done", (isSetup: boolean) => {
        if (!isSetup || typeof window.webpushr === "undefined") {
          setError(
            "Push notification service is still initializing. Please wait a moment and try again."
          );
          setIsLoading(false);
          return;
        }

        // SDK is ready, now subscribe
        window.webpushr("subscribe", (sid: string) => {
          if (sid) {
            setIsSubscribed(true);
            saveSubscriberId(sid);
          } else {
            setError("Failed to subscribe. Please try again.");
          }
          setIsLoading(false);
        });
      });
    } catch (error) {
      console.error("Failed to subscribe:", error);
      setError(error instanceof Error ? error.message : "Failed to subscribe");
      setIsLoading(false);
    }
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
