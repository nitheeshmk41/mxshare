"use client";

import React, { useState } from "react";

export default function AISummary({ fileId, initialSummary }: { fileId: string; initialSummary?: string }) {
  const [summary, setSummary] = useState(initialSummary || "");
  const [loading, setLoading] = useState(false);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/summary`);
      const json = await res.json();
      if (json.success) {
        setSummary(json.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 border rounded-lg bg-card text-card-foreground" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-lg">AI Summary</h3>
        {!summary && (
          <button
            onClick={generateSummary}
            disabled={loading}
            className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {loading ? "Generating..." : "Generate Summary"}
          </button>
        )}
      </div>
      
      {summary ? (
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {summary}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Click generate to get an AI-powered summary of this file and its comments.
        </p>
      )}
    </div>
  );
}
