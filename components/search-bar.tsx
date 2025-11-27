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
    <div className="relative w-full" ref={boxRef}>
      <Input
        placeholder="Search files, subjects, semesters..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-12 text-base"
      />

      {/* Search Results Dropdown */}
      {show && results.length > 0 && (
        <div
          className={cn(
            "absolute top-14 w-full bg-white dark:bg-neutral-900 border shadow-lg rounded-lg z-50 p-2"
          )}
        >
          {results.map((file) => (
            <Link
              href={`/file/${file._id}`}
              key={file._id}
              className="block px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md"
            >
              <p className="font-medium">{file.title}</p>
              <p className="text-xs text-muted-foreground">
                {file.subject} • Sem {file.semester}
              </p>
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {show && query && results.length === 0 && (
        <div className="absolute top-14 w-full bg-neutral-50 dark:bg-neutral-900 border shadow-md rounded-lg z-50 p-3 text-sm text-center text-muted-foreground">
          No results found
        </div>
      )}
    </div>
  );
}
