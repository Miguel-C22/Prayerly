"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function WebpushrProvider() {
  useEffect(() => {
    // Create the Webpushr stub function BEFORE loading the SDK
    // This is required by Webpushr to queue commands until the SDK loads
    if (
      typeof window !== "undefined" &&
      typeof window.webpushr === "undefined"
    ) {
      // Create stub function with queue
      window.webpushr =
        window.webpushr ||
        function (...args: any[]) {
          (window.webpushr!.q = window.webpushr!.q || []).push(args);
        };
      window.webpushr.q = [];
    }

    // Debug: Check if environment variable is accessible
    const key = process.env.NEXT_PUBLIC_WEBPUSHR_PUBLIC_KEY;
    console.log("Webpushr Public Key available:", !!key);
    if (!key) {
      console.error("NEXT_PUBLIC_WEBPUSHR_PUBLIC_KEY is not set!");
    }
  }, []);

  return (
    <Script
      id="webpushr-sdk"
      strategy="afterInteractive"
      src="https://cdn.webpushr.com/app.min.js"
      onLoad={() => {
        if (typeof window !== "undefined" && window.webpushr) {
          try {
            const key = process.env.NEXT_PUBLIC_WEBPUSHR_PUBLIC_KEY;

            window.webpushr("setup", { key: key || "" });

            // Listen for errors
            window.webpushr("onError", (error: any) => {
              console.error("Webpushr Error:", error);
            });
          } catch (error) {
            console.error("Webpushr setup error:", error);
          }
        }
      }}
      onError={(e) => {
        console.error("Failed to load Webpushr SDK from CDN:", e);
      }}
    />
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    webpushr?: ((command: string, ...args: any[]) => void) & { q?: any[] };
  }
}
