"use client";

import { useEffect, useMemo, useState } from "react";
import FileCard from "@/components/file-card";

type FileResult = {
  _id: string;
  title: string;
  subject?: string;
  semester?: string;
  [key: string]: unknown;
};

const isFileResult = (value: unknown): value is FileResult => {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate._id === "string" && typeof candidate.title === "string";
};

const normalizeResults = (payload: unknown): FileResult[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isFileResult);
  }
  return isFileResult(payload) ? [payload] : [];
};

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<FileResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch files");
        }

        const data = await res.json();
        setFiles(normalizeResults(data));
      } catch (err) {
        if ((err as DOMException)?.name !== "AbortError") {
          setError("Unable to load files. Please try again.");
          setFiles([]);
        }
      } finally {
        setLoading(false);
      }
    }, query ? 300 : 0);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  const subjects = useMemo(() => {
    const allSubjects = files.map((f) => f.subject).filter(Boolean) as string[];
    return Array.from(new Set(allSubjects)).sort();
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (!selectedSubject) return files;
    return files.filter((f) => f.subject === selectedSubject);
  }, [files, selectedSubject]);

  const heading = useMemo(() => {
    if (loading) return "Loading your resources...";
    if (error) return "Something went wrong";
    if (!filteredFiles.length) return query ? "No files match your search" : "No files yet";
    return query ? `Results for "${query}"` : "Latest uploads";
  }, [loading, error, filteredFiles.length, query]);

  return (
    <div
      className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen bg-background text-foreground"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage and explore shared resources</p>
          </div>
          <a
            href="/upload"
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition font-medium text-center shadow-lg shadow-primary/20"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Upload File
          </a>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files, subjects, semesters..."
            className="w-full h-12 rounded-xl border px-12 text-base bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all"
            style={{
              background: "var(--card)",
              color: "var(--foreground)",
              borderColor: "var(--border)",
            }}
          />
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Subject Filters */}
        {subjects.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !selectedSubject
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject === selectedSubject ? null : subject)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  subject === selectedSubject
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-muted-foreground">{heading}</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-card border animate-pulse"
                style={{ borderColor: "var(--border)" }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map((file) => (
              <FileCard key={file._id} file={file} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
