import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Casual OS - Build Apps with Natural Language",
  description: "Create sophisticated, production-ready applications through natural language descriptions. Democratizing software creation.",
  keywords: ["AI", "app builder", "no-code", "natural language", "software development"],
  authors: [{ name: "Casual OS Team" }],
  creator: "Casual OS",
  publisher: "Casual OS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env['NEXT_PUBLIC_APP_URL'] ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "./",
    siteName: "Casual OS",
    title: "Casual OS - Build Apps with Natural Language",
    description: "Create sophisticated, production-ready applications through natural language descriptions.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Casual OS - AI-Powered App Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@casualos",
    creator: "@casualos",
    title: "Casual OS - Build Apps with Natural Language",
    description: "Create sophisticated, production-ready applications through natural language descriptions.",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env['NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <meta name="theme-color" content="#0B0C12" />
        <meta name="color-scheme" content="dark light" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}