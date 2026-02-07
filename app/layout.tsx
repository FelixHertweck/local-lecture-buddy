import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

// Load custom fonts from Google Fonts
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Application metadata for SEO and PWA
export const metadata: Metadata = {
  title: "Lecture Buddy - Local AI Assistant",
  description:
    "Your AI-powered lecture assistant runs completely locally in the browser.",
  authors: [
    { name: "Felix Hertweck", url: "https://github.com/FelixHertweck" },
  ],
  creator: "Felix Hertweck",
  icons: {
    icon: [
      { url: "favicon.ico", sizes: "any" },
      { url: "favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "site.webmanifest",
  other: {
    "theme-color": "#ffffff",
    "color-scheme": "light dark",
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
  },
};

// Root layout component that wraps the entire application
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Lecture Buddy - Local AI Assistant</title>
        {/* Origin trial tokens for browser APIs */}
        <meta
          httpEquiv="origin-trial"
          content="Au2XGBVCng8laatAt3TPCfUo5NOw0MVS2qlnKQf5Gab2KxToJ1fIktTS7xh9A222xMnb9AvUJA4hQvNzZX2uwQwAAABdeyJvcmlnaW4iOiJodHRwOi8vbG9jYWxob3N0OjMwMDAiLCJmZWF0dXJlIjoiQUlQcm9tcHRBUElNdWx0aW1vZGFsSW5wdXQiLCJleHBpcnkiOjE3NzQzMTA0MDB9"
        />
        <meta
          httpEquiv="origin-trial"
          content="ArT0gIufN+Aw2IYoZljU7Bb6PxAR1xDeyeoFJrCg0DjHRxQCBiiACB8T1sEyvDGL4LnHU8r26ys9d+GQZRm9ug8AAABreyJvcmlnaW4iOiJodHRwczovL2ZlbGl4aGVydHdlY2suZ2l0aHViLmlvOjQ0MyIsImZlYXR1cmUiOiJBSVByb21wdEFQSU11bHRpbW9kYWxJbnB1dCIsImV4cGlyeSI6MTc3NDMxMDQwMH0="
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Theme provider for light/dark mode support */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
