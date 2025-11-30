"use client";

import { ReactNode, useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";

const INITIAL_LOADER_DELAY_MS = 900;
const LOADER_MESSAGES = [
  "Linking MXShare vaults…",
  "Warming up AI hints…",
  "Syncing course drops…",
];

const ORB_COORDINATES = [
  { top: "12%", left: "18%", delay: "0s" },
  { top: "22%", right: "15%", delay: "0.3s" },
  { bottom: "16%", left: "20%", delay: "0.6s" },
  { bottom: "10%", right: "20%", delay: "0.9s" },
];

const SESSION_STORAGE_KEY = "mxshare-initial-loader";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <InitialLoader>{children}</InitialLoader>
    </SessionProvider>
  );
}

function InitialLoader({ children }: { children: ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const hasSeenLoader = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (hasSeenLoader) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoader(false);
      sessionStorage.setItem(SESSION_STORAGE_KEY, "1");
    }, INITIAL_LOADER_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showLoader) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADER_MESSAGES.length);
    }, 900);
    return () => clearInterval(interval);
  }, [showLoader]);

  return (
    <div className="relative">
      {showLoader && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#040a16] via-[#020714] to-[#01030b] text-white">
          <div className="absolute inset-0 opacity-50">
            {ORB_COORDINATES.map((orb, idx) => (
              <div
                key={`orb-${idx}`}
                className="absolute w-28 h-28 rounded-full bg-cyan-400/25 blur-3xl animate-pulse"
                style={{
                  top: orb.top,
                  bottom: orb.bottom,
                  left: orb.left,
                  right: orb.right,
                  animationDelay: orb.delay,
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center text-center gap-4 px-6">
            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.5em] text-white/70">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
              <span>mxshare live</span>
            </div>

            <p className="text-2xl font-semibold text-white/90">
              Surfacing fresh drops…
            </p>
            <p className="text-sm text-white/70">
              {LOADER_MESSAGES[messageIndex]}
            </p>

            <div className="w-56 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-white via-cyan-200 to-white animate-pulse" />
            </div>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/50">
              {[0, 1, 2].map((idx) => (
                <span
                  key={`pulse-${idx}`}
                  className={`w-1.5 h-1.5 rounded-full bg-white/50 ${
                    messageIndex === idx ? "opacity-100" : "opacity-40"
                  }`}
                />
              ))}
              <span className="text-white/60">stay synced</span>
            </div>
          </div>
        </div>
      )}
      <div
        className={`transition-opacity duration-300 ${
          showLoader ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
