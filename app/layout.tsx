import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dadsrecipelist.com"),
  title: "Dad's Recipes",
  description: "Personal recipe collection",
  applicationName: "Dad's Recipes",
  manifest: "/manifest.webmanifest",
  themeColor: "#ff3032",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dad's Recipes",
  },
  icons: {
    icon: [
      {
        url: "/dads-recipes-icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/dads-recipes-icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/dads-recipes-icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
