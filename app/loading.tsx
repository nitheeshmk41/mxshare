"use client";

import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      <div className="relative w-24 h-24 mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        {/* Spinning Ring */}
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        {/* Inner Pulse */}
        <div className="absolute inset-6 bg-primary/10 rounded-full animate-pulse flex items-center justify-center">
          <span className="text-xs font-bold text-primary">MX</span>
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-bold tracking-tight animate-pulse">MXShare</h2>
        <p className="text-sm text-muted-foreground">Loading resources...</p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1 bg-muted rounded-full mt-6 overflow-hidden">
        <div className="h-full bg-primary animate-progress-indeterminate"></div>
      </div>
      
      <style jsx>{`
        @keyframes progress-indeterminate {
          0% { width: 0%; margin-left: 0%; }
          50% { width: 70%; margin-left: 30%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
          animation: progress-indeterminate 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
