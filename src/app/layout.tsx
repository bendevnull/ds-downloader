'use client';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CachePromptModal from "@/components/CachePromptModal";
import StoreProvider from "@/components/StoreProvider";
// import "./globals.css";
// import "bootstrap/dist/css/bootstrap.min.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>DS Downloader</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.2/css/bulma.min.css" />
      </head>
      <body>
        <StoreProvider>
          <Navbar />
          <CachePromptModal />
          <section className="section">{children}</section>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}
