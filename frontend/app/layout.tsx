// app/layout.tsx
import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navigation from "@/components/navigation"; // 새로운 클라이언트 컴포넌트
import Chatbot from "@/components/features/chatbot";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "멍토리",
  description: "Created with v0",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/paw-favicon.png" type="image/png" />
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
          }
        `}</style>
      </head>
      <body>
        <Navigation /> {/* 클라이언트 컴포넌트로 네비게이션 처리 */}
        {children}
        <Chatbot />
        <Toaster />
      </body>
    </html>
  );
}