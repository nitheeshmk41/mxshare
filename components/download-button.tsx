"use client";
import React, { useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import gsap from "gsap";

export default function DownloadButton({ fileId, driveUrl }: { fileId: string; driveUrl: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = React.useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      // Initial pulse animation
      gsap.fromTo(buttonRef.current,
        { scale: 1, boxShadow: "0 4px 6px rgba(124, 58, 237, 0.3)" },
        {
          scale: 1.05,
          boxShadow: "0 8px 20px rgba(124, 58, 237, 0.5)",
          duration: 0.8,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        }
      );
    }
  }, []);

  const handleDownload = async () => {
    if (!session) {
      signIn("google");
      return;
    }

    const key = `downloaded:${fileId}`;
    if (sessionStorage.getItem(key)) {
      // already counted this session — just open
      window.open(driveUrl, "_blank", "noopener,noreferrer");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/download`, { method: "POST" });
      if (res.ok) {
        sessionStorage.setItem(key, "1");
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
      window.open(driveUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <button 
      ref={buttonRef}
      onClick={handleDownload} 
      className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-medium disabled:opacity-50"
      style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
      disabled={loading}
    >
      {loading ? "Preparing..." : "📥 Download"}
    </button>
  );
}
