import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import type { ReactNode } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CursorFollower from "@/components/cursor-follower";

export const metadata: Metadata = {
  title: "PSG Tech Notes Share",
  description: "Notes and resources shared by PSG Tech students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className="antialiased bg-background text-foreground"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <Providers>
          <CursorFollower />
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
