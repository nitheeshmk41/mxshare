"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

let debounceTimer: NodeJS.Timeout;

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [show, setShow] = useState(false);

  const boxRef = useRef<HTMLDivElement>(null);

  // 🧠 Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShow(false);
      return;
    }

    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) {
          setResults([]);
          setShow(true);
          return;
        }
        const data = await res.json();
        setResults(Array.isArray(data) ? data : data ? [data] : []);
        setShow(true);
      } catch (err) {
        setResults([]);
        setShow(true);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // 🔥 Hide dropdown when clicking outside
  useEffect(() => {
    function handler(e: any) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShow(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative w-full z-[10000]" ref={boxRef}>
      <Input
        placeholder="Search files, subjects, semesters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 text-base bg-background text-foreground relative z-[10001]"
        style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
      />

      {/* Search Results Dropdown */}
      {show && results.length > 0 && (
        <div
          className="absolute top-14 left-0 right-0 bg-card border border-primary/20 shadow-2xl rounded-xl z-[10002] max-h-[50vh] overflow-hidden backdrop-blur-xl"
          style={{ 
            background: "var(--card)", 
            borderColor: "var(--border)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(129,140,248,0.1)"
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/50 bg-primary/5 flex justify-between items-center">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
            <span className="text-[10px] text-muted-foreground">Press Enter to select</span>
          </div>
          
          {/* Scrollable Results */}
          <div className="overflow-y-auto max-h-[calc(50vh-40px)] p-1.5">
            {results.map((file, index) => (
              <Link
                href={`/file/${file._id}`}
                key={file._id}
                className="group block px-3 py-2.5 hover:bg-primary/5 rounded-lg transition-all duration-200 text-left border border-transparent hover:border-primary/10 mb-1"
                style={{ color: "var(--card-foreground)" }}
                onClick={() => setShow(false)}
              >
                {/* Title with index */}
                <div className="flex items-center gap-3">
                  <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-left text-sm leading-tight group-hover:text-primary transition-colors truncate">
                      {file.title}
                    </p>
                    
                    {/* Metadata row */}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="font-medium text-primary/80">{file.subject}</span>
                      <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                      <span>{file.semester}</span>
                      {file.rating > 0 && (
                        <>
                          <span className="w-0.5 h-0.5 rounded-full bg-muted-foreground/40" />
                          <span className="flex items-center gap-0.5">
                            <span>⭐</span>
                            <span>{file.rating.toFixed(1)}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Arrow indicator */}
                  <span className="flex-shrink-0 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all text-xs">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {show && query && results.length === 0 && (
        <div 
          className="absolute top-14 left-0 right-0 bg-card border border-border/50 shadow-xl rounded-xl z-[10002] p-6 text-center backdrop-blur-xl"
          style={{ 
            background: "var(--muted)", 
            borderColor: "var(--border)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
          }}
        >
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-medium text-foreground mb-1">No results found</p>
          <p className="text-xs text-muted-foreground">
            Try different keywords or check your spelling
          </p>
        </div>
      )}
    </div>
  );
}
