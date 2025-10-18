"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Extend window type for OneSignal
declare global {
  interface Window {
    OneSignalDeferred?: any[];
  }
}

interface PushNotificationContextType {
  isSubscribed: boolean;
  setIsSubscribed: (subscribed: boolean) => void;
  isLoading: boolean;
}

const PushNotificationContext = createContext<
  PushNotificationContextType | undefined
>(undefined);

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check subscription status once on app load
    const checkSubscription = async () => {
      try {
        // Check browser support
        if (
          !(
            "Notification" in window &&
            "serviceWorker" in navigator &&
            "PushManager" in window
          )
        ) {
          setIsLoading(false);
          return;
        }

        if (!window.OneSignalDeferred) {
          setIsLoading(false);
          return;
        }

        window.OneSignalDeferred.push(async (OneSignal: any) => {
          try {
            // Wait for OneSignal to initialize
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // Check if THIS device has local subscription state
            const optedIn = await OneSignal.User.PushSubscription.optedIn;
            const subscriberId = await OneSignal.User.PushSubscription.id;
            const token = await OneSignal.User.PushSubscription.token;

            // If SDK says not subscribed locally, no need to check backend
            if (!subscriberId || !token || !optedIn) {
              setIsSubscribed(false);
              setIsLoading(false);
              return;
            }

            // Step 2: SDK says subscribed - verify with backend (source of truth)
            try {
              const response = await fetch(
                `/api/user/push-subscription-status?subscriberId=${subscriberId}`
              );

              if (!response.ok) {
                setIsSubscribed(false);
                setIsLoading(false);
                return;
              }

              const { isActive } = await response.json();

              if (!isActive) {
                // Backend says subscription is invalid - mark as not subscribed
                console.log("Subscription not active in backend");
                setIsSubscribed(false);
              } else {
                // Both SDK and backend confirm subscription is active
                setIsSubscribed(true);
              }
            } catch (backendError) {
              console.error("Error verifying with backend:", backendError);
              // If backend check fails, fall back to SDK state
              setIsSubscribed(true);
            }

            setIsLoading(false);
          } catch (error) {
            console.error("Error checking OneSignal subscription:", error);
            setIsSubscribed(false);
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscribed(false);
        setIsLoading(false);
      }
    };

    checkSubscription();
  }, []); // Only run once on app mount

  return (
    <PushNotificationContext.Provider
      value={{ isSubscribed, setIsSubscribed, isLoading }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotification() {
  const context = useContext(PushNotificationContext);
  if (context === undefined) {
    throw new Error(
      "usePushNotification must be used within PushNotificationProvider"
    );
  }
  return context;
}
