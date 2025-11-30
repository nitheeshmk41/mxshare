"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CursorFollower() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on server or if not visible yet
  if (!isVisible) return null;

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 w-8 h-8 border border-primary rounded-full mix-blend-difference"
        style={{
          translateX: cursorXSpring,
          translateY: cursorYSpring,
        }}
      />
      <motion.div
        className="absolute top-0 left-0 w-2 h-2 bg-primary rounded-full mix-blend-difference"
        style={{
          translateX: cursorX,
          translateY: cursorY,
          marginLeft: 12,
          marginTop: 12,
        }}
      />
    </div>
  );
}
