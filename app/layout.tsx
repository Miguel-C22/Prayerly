import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { PushNotificationProvider } from "@/contexts/PushNotificationContext";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Prayerly",
  description: "Your prayer and reminder app",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prayerly",
  },
  applicationName: "Prayerly",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/icon.jpeg" type="image/jpeg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Prayerly" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1F2937" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <link rel="apple-touch-icon" href="/images/icon.jpeg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.setAttribute('data-theme', theme);

                // Update theme-color meta tag based on theme
                const themeColor = theme === 'dark' ? '#1F2937' : '#FFFFFF';
                const metaThemeColor = document.querySelector('meta[name="theme-color"]');
                if (metaThemeColor) {
                  metaThemeColor.setAttribute('content', themeColor);
                }

                // Update status bar style based on theme
                const statusBarStyle = theme === 'dark' ? 'black-translucent' : 'default';
                const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                if (metaStatusBar) {
                  metaStatusBar.setAttribute('content', statusBarStyle);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <NuqsAdapter>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <PushNotificationProvider>
              <div>{children}</div>
            </PushNotificationProvider>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
