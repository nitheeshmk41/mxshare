"use client";

import Hero from "@/components/hero";
import FileCard from "@/components/file-card";
import Footer from "@/components/footer";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

async function getStats() {
  const base = process.env.URL || "http://localhost:3000";
  try {
    const res = await fetch(`${base}/api/stats`, { cache: "no-store" });
    if (res.ok) return res.json();
  } catch (e) {
    return null;
  }
  return null;
}

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  const whySectionRef = useRef<HTMLElement>(null);
  const topPerformersRef = useRef<HTMLElement>(null);
  const recentSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchData() {
      const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      try {
        const [searchRes, statsData] = await Promise.all([
          fetch(`${base}/api/search?q=`, { cache: "no-store" }),
          getStats(),
        ]);

        if (searchRes.ok) {
          const data = await searchRes.json();
          // Limit to 6 recent uploads
          setFiles(data.slice(0, 6));
        }
        setStats(statsData);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // Animations on scroll
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Why MXShare cards stagger animation
      if (whySectionRef.current) {
        const cards = whySectionRef.current.querySelectorAll(".why-card");
        gsap.fromTo(
          cards,
          {
            y: 60,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            scrollTrigger: {
              trigger: whySectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Top performers animation
      if (topPerformersRef.current) {
        const performers = topPerformersRef.current.querySelectorAll(".performer-card");
        gsap.fromTo(
          performers,
          {
            y: 80,
            opacity: 0,
            rotateX: -15,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.9,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: topPerformersRef.current,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Recent files animation
      if (recentSectionRef.current) {
        const recentCards = recentSectionRef.current.querySelectorAll(".recent-card");
        gsap.fromTo(
          recentCards,
          {
            y: 50,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: recentSectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [files, stats]);

  const topPerformers = stats?.topFiles?.slice(0, 3) || [];
  const recentFiles = files.slice(0, 10);

  return (
    <main
      className="min-h-screen bg-background text-foreground overflow-x-hidden"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <Hero />

      {/* Why MXShare Section */}
      <section ref={whySectionRef} className="relative py-20 md:py-28">
        {/* soft background accent */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10/10 via-transparent to-transparent" />
        
        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-[10%] h-2 w-2 rounded-full bg-primary/40 animate-float" style={{ animationDelay: '0s' }} />
          <div className="absolute top-40 right-[15%] h-3 w-3 rounded-full bg-sky-400/30 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-32 left-[20%] h-2 w-2 rounded-full bg-emerald-400/40 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[60%] right-[25%] h-2 w-2 rounded-full bg-primary/30 animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight animate-fade-in">
              <span className="bg-gradient-to-r from-primary via-sky-400 to-emerald-400 bg-clip-text text-transparent">
                Why MXShare?
              </span>
            </h2>
            <p
              className="mt-4 text-lg md:text-xl font-medium italic text-primary/90 animate-fade-in"
              style={{ color: "var(--primary)", animationDelay: '0.2s' }}
            >
              &quot;Learn together. Grow together.&quot;
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div
              className="why-card group relative rounded-2xl border border-border/70 bg-card/70 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-[0_26px_90px_rgba(129,140,248,0.55)] hover:rotate-1"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 via-transparent to-emerald-400/10" />
              <div className="relative text-center">
                <div className="mb-4 text-4xl md:text-5xl">🗄️</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Centralized Knowledge Grid
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  One searchable hub for every note, slide, and PDF. No more
                  lost links, scattered drives, or buried folders.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="why-card group relative rounded-2xl border border-border/70 bg-card/70 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-[0_26px_90px_rgba(129,140,248,0.55)] hover:scale-105"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-sky-400/10 via-transparent to-primary/15" />
              <div className="relative text-center">
                <div className="mb-4 text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">🤝</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Community-Driven Learning
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Upload once, share with many. Curate the best resources and
                  learn from what your peers actually use.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="why-card group relative rounded-2xl border border-border/70 bg-card/70 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-primary/60 hover:shadow-[0_26px_90px_rgba(129,140,248,0.55)] hover:-rotate-1"
              style={{ background: "var(--card)", borderColor: "var(--border)" }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-emerald-400/10 via-transparent to-sky-400/15" />
              <div className="relative text-center">
                <div className="mb-4 text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">⚡</div>
                <h3 className="text-lg md:text-xl font-bold mb-2">
                  Fast, Reliable, Effortless
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  Optimized uploads, instant search, and smooth access across
                  laptop, tablet, and phone—no friction, just focus.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top 3 Performers */}
      {topPerformers.length > 0 && (
        <section ref={topPerformersRef} className="relative py-16 md:py-20">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
          
          {/* Sparkle effects */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-10 left-[15%] h-1 w-1 rounded-full bg-yellow-400/60 animate-pulse" />
            <div className="absolute top-24 right-[20%] h-1 w-1 rounded-full bg-amber-400/60 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-20 left-[25%] h-1 w-1 rounded-full bg-yellow-300/60 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 flex items-center justify-center gap-3">
              <span className="text-yellow-400 text-2xl animate-bounce">🏆</span>
              <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent">
                Top Performers
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {topPerformers.map((f: any, index: number) => {
                const ratings = Array.isArray(f.ratings) ? f.ratings : [];
                const avg = ratings.length
                  ? (ratings.reduce((s: number, r: any) => s + (r.stars || 0), 0) / ratings.length).toFixed(1)
                  : "—";
                const uploader = f.author || (f.authorEmail ? f.authorEmail.split("@")[0] : "Anonymous");
                const uploaderEmail = f.authorEmail;

                return (
                  <div
                    key={f._id}
                    className="performer-card group relative rounded-2xl border border-border/70 bg-card/70 p-0.5 shadow-[0_20px_60px_rgba(15,23,42,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:border-yellow-400/70 hover:scale-105 hover:rotate-1"
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-yellow-400/25 via-transparent to-amber-500/25" />

                    <div className="absolute -top-4 -right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold shadow-lg border border-black/20 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                      {index === 0 && (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white animate-pulse">
                          1
                        </div>
                      )}
                      {index === 1 && (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-slate-300 to-slate-500 text-white">
                          2
                        </div>
                      )}
                      {index === 2 && (
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-500 text-white">
                          3
                        </div>
                      )}
                    </div>

                    <div className="relative rounded-2xl bg-card/90 p-5 transition-transform duration-300 group-hover:scale-[1.02] space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <a href={`/file/${f._id}`} className="text-lg font-semibold hover:underline">
                            {f.title}
                          </a>
                          <p className="text-sm text-muted-foreground">{f.subject} • Sem {f.semester}</p>
                          <p className="text-xs text-muted-foreground">Uploaded by {uploader}{uploaderEmail ? ` (${uploaderEmail})` : ""}</p>
                        </div>
                        <div className="text-right text-sm text-muted-foreground space-y-1">
                          <div className="font-semibold text-foreground">⭐ {avg}</div>
                          <div>Views: {f.views ?? 0}</div>
                          <div>Downloads: {f.downloads ?? 0}</div>
                        </div>
                      </div>
                      {ratings.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-1.5 w-full rounded-full bg-border/70 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-emerald-400"
                              style={{ width: `${Math.min(Number(avg) * 20, 100)}%` }}
                            />
                          </div>
                          <span className="min-w-[40px] text-right">{ratings.length} ratings</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Recently Added Notes */}
      {recentFiles.length > 0 && (
        <section ref={recentSectionRef} className="py-16 md:py-20 bg-background relative">
          {/* Subtle grid pattern */}
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03] [background-image:linear-gradient(to_right,rgba(129,140,248,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(129,140,248,0.5)_1px,transparent_1px)] [background-size:60px_60px]" />
          
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 flex items-center justify-center gap-3">
              <span className="text-blue-400 text-2xl animate-pulse">📝</span>
              <span className="bg-gradient-to-r from-sky-400 via-primary to-emerald-400 bg-clip-text text-transparent">
                Recently Added
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recentFiles.map((f: any) => (
                <div
                  key={f._id}
                  className="recent-card group relative rounded-2xl border border-border/70 bg-card/70 p-0.5 shadow-[0_18px_55px_rgba(15,23,42,0.65)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-sky-400/70 hover:shadow-[0_24px_70px_rgba(56,189,248,0.4)]"
                >
                  <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-sky-400/20 via-transparent to-primary/25" />
                  <div className="relative rounded-2xl bg-card/90 p-4 transition-transform duration-300 group-hover:scale-[1.02]">
                    <FileCard file={f} showHints={false} compactMeta />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-muted/30 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-primary mb-2">{stats.totalViews}</div>
                <div className="text-muted-foreground font-medium">Total Views</div>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.fileCount}</div>
                <div className="text-muted-foreground font-medium">Total Uploads</div>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{stats.userCount || "100+"}</div>
                <div className="text-muted-foreground font-medium">Active Students</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Optional footer if you want it visible on home */}
      {/* <Footer /> */}
    </main>
  );
}
