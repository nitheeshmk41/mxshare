"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import gsap from "gsap";
import SearchBar from "@/components/search-bar";

export default function Hero() {
  const containerRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }
      )
        .fromTo(
          titleRef.current,
          { y: 40, opacity: 0, filter: "blur(6px)" },
          { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.9 },
          "-=0.2"
        )
        .fromTo(
          textRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.4"
        )
        .fromTo(
          buttonsRef.current,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          "-=0.4"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!titleRef.current) return;
    const rect = titleRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 18;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 18;
    setMousePosition({ x, y });
  };

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center bg-background"
      style={{ color: "var(--foreground)" }}
    >
      {/* Futuristic layered background */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* soft glow blobs - enhanced for light mode */}
        <div className="absolute -left-32 top-[-10%] h-72 w-72 rounded-full bg-primary/30 dark:bg-primary/20 blur-3xl opacity-70 animate-float" style={{ animationDelay: "0s" }} />
        <div className="absolute right-[-10%] top-1/3 h-80 w-80 rounded-full bg-cyan-400/30 dark:bg-[rgba(56,189,248,0.2)] blur-3xl opacity-80 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-[-20%] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-teal-300/30 dark:bg-[rgba(94,234,212,0.2)] blur-3xl opacity-80 animate-float" style={{ animationDelay: "4s" }} />

        {/* subtle grid - more visible in light mode */}
        <div className="absolute inset-0 opacity-[0.15] dark:opacity-[0.08] mix-blend-multiply dark:mix-blend-soft-light [background-image:linear-gradient(to_right,rgba(100,116,139,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.5)_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,rgba(148,163,184,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.35)_1px,transparent_1px)] [background-size:40px_40px]" />

        {/* vignette - adjusted for light mode */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.08),_transparent_60%)] dark:bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-4 text-center w-full py-12">
        {/* top badge / pill */}
        <div
          ref={badgeRef}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 dark:border-primary/20 bg-white/80 dark:bg-background/60 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] backdrop-blur-xl shadow-lg dark:shadow-none"
          style={{
            boxShadow: "0 0 0 1px rgba(124,58,237,0.1), 0 4px 12px rgba(15,23,42,0.1)",
          }}
        >
          <span className="h-1 w-1 rounded-full bg-primary shadow-[0_0_8px_rgba(124,58,237,0.6)]" />
          <span className="text-slate-700 dark:text-foreground">Share Knowledge, Learn Together</span>
        </div>

        {/* Title with interactive 3D tilt */}
        <div
          className="relative inline-block"
          style={{ perspective: "1300px" }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => {
            setIsHovering(false);
            setMousePosition({ x: 0, y: 0 });
          }}
        >
          {/* glow ring behind title - enhanced for light mode */}
          <div className="pointer-events-none absolute inset-[-40px] -z-10 rounded-[40px] bg-[conic-gradient(from_140deg,rgba(94,234,212,0.0),rgba(94,234,212,0.6),rgba(124,58,237,0.5),rgba(236,72,153,0.6),rgba(94,234,212,0.0))] dark:bg-[conic-gradient(from_140deg,rgba(94,234,212,0.0),rgba(94,234,212,0.5),rgba(129,140,248,0.4),rgba(236,72,153,0.5),rgba(94,234,212,0.0))] opacity-50 dark:opacity-70 blur-2xl" />

          <h1
            ref={titleRef}
            className="text-balance text-5xl font-black tracking-tight md:text-7xl lg:text-8xl"
            style={{
              transform: isHovering
                ? `rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale3d(1.06,1.06,1.06)`
                : "none",
              transformStyle: "preserve-3d",
              transition:
                "transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1), filter 220ms",
              filter: isHovering
                ? "drop-shadow(0 30px 60px rgba(88,28,135,0.4))"
                : "drop-shadow(0 8px 24px rgba(15,23,42,0.2))",
              backgroundImage:
                "linear-gradient(120deg, #1e293b, rgba(124,58,237,0.95), rgba(20,184,166,0.95))",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            MXShare
          </h1>

          {/* Water ripple effect on hover */}
          {isHovering && (
            <div className="absolute inset-0 pointer-events-none overflow-visible">
              <div 
                className="absolute inset-0 animate-ripple rounded-full bg-gradient-to-r from-primary/12 via-cyan-400/12 to-emerald-400/12" 
                style={{ 
                  animationDelay: '0s',
                  transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
                  filter: 'blur(10px)'
                }} 
              />
              <div 
                className="absolute inset-0 animate-ripple rounded-full bg-gradient-to-r from-cyan-400/8 via-primary/8 to-pink-400/8" 
                style={{ 
                  animationDelay: '0.4s',
                  transform: `translate(${mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
                  filter: 'blur(14px)'
                }} 
              />
            </div>
          )}

          {/* ultra subtle "scanline" accent */}
          <div className="pointer-events-none absolute inset-x-[-20%] top-1/2 -z-10 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent opacity-60" />
        </div>

        {/* Subheading */}
        <p
          ref={textRef}
          className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          <span className="font-medium text-foreground">
            Your centralized knowledge hub.
          </span>{" "}
          Instantly share notes, assignments, and resources with your peers. Search across everything,{" "}
        </p>

        {/* Main actions + search */}
        <div
          ref={buttonsRef}
          className="mt-10 flex w-full max-w-3xl flex-col gap-5"
        >
          {/* Search Bar card */}
          <div
            className="relative rounded-2xl border border-slate-300 dark:border-border/60 bg-white/90 dark:bg-background/70 p-3 shadow-xl dark:shadow-[0_18px_80px_rgba(15,23,42,0.7)] backdrop-blur-2xl overflow-visible z-[10000]"
          >
            {/* Animated running line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden z-0">
              <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent opacity-70 animate-running-line" />
            </div>
            <SearchBar />
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-slate-300 dark:border-border/70 bg-slate-100 dark:bg-transparent text-[9px]">
                  ⌘K
                </span>
                <span className="text-slate-700 dark:text-muted-foreground">Open global search</span>
              </span>
              <span className="hidden items-center gap-1 sm:inline-flex">
                <span className="h-1 w-1 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-slate-700 dark:text-muted-foreground">Live index · &lt; 200ms answers</span>
              </span>
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="/upload"
              className="group relative w-full overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-r from-primary to-primary/80 px-8 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(129,140,248,0.75)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(129,140,248,0.9)] sm:w-auto"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent)] opacity-80 transition-transform duration-700 group-hover:translate-x-[120%]" />
              <span className="relative flex items-center justify-center gap-2">
                <span className="text-lg">📤</span>
                <span>Upload notes to the grid</span>
              </span>
            </a>

            <a
              href="/dashboard"
              className="relative w-full rounded-xl border border-slate-300 dark:border-border/60 bg-white/90 dark:bg-background/70 px-8 py-3 text-center text-sm font-semibold text-slate-800 dark:text-foreground shadow-lg dark:shadow-[0_18px_40px_rgba(15,23,42,0.85)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl dark:hover:shadow-[0_24px_70px_rgba(15,23,42,0.95)] sm:w-auto"
            >
              <span className="relative flex items-center justify-center gap-2">
                <span className="text-lg">📚</span>
                <span>Browse the shared library</span>
              </span>
            </a>
          </div>

          {/* tiny meta row */}
          <div className="mt-1 flex flex-col items-center justify-center gap-2 text-[11px] text-muted-foreground sm:flex-row">
            <span>Encrypted uploads • Versioned files • Real-time search</span>
            
          </div>
        </div>
      </div>
    </section>
  );
}
