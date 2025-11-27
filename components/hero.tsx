"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Hero() {
  const ref = useRef(null);

  useEffect(() => {
    gsap.from(ref.current, {
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });
  }, []);

  return (
    <section ref={ref} className="text-center py-20 bg-gradient-to-b from-white via-neutral-50 to-white">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-5xl md:text-6xl font-extrabold">MXShare</h1>
        <p className="text-muted-foreground mt-3 text-lg">Search. Share. Learn. Community-driven notes & resources for PSGTech.</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <a href="/upload" className="btn btn-primary">Upload</a>
          <a href="/dashboard" className="btn">Browse</a>
        </div>
      </div>
    </section>
  );
}
