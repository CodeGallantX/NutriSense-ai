/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Instrument_Serif } from "next/font/google"


const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: ["400"],
  display: "swap",
  preload: true,
})

// 1. Standard Width Family (Main Text)
const polysans = localFont({
  src: [
    {
      path: "../public/fonts/polysanstrial-slim.otf",
      weight: "300", // Slim -> Light
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-neutral.otf",
      weight: "400", // Neutral -> Normal
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-median.otf",
      weight: "500", // Median -> Medium
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-bulky.otf",
      weight: "700", // Bulky -> Bold
      style: "normal",
    },
  ],
  variable: "--font-polysans",
});


// Wide Family (For headers or display text)
const polysansWide = localFont({
  src: [
    {
      path: "../public/fonts/polysanstrial-slimwide.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-neutralwide.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-medianwide.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/polysanstrial-bulkywide.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-polysans-wide",
});

export const metadata: Metadata = {
  title: "NutriSense AI - Smart Nutrition Guidance for Everyone",
  description:
    "NutriSense AI is a digital nutrition assistant designed to help individuals make healthier, more affordable, and culturally relevant food choices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${polysans.variable} ${instrumentSerif.variable} ${polysansWide.variable}`}
      >
        <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:wght@400&display=swap" />
      </head>
          <body className={polysans.className}>{children}</body>
      </html>
  );
}
