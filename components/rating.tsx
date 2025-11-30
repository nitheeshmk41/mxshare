"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";

export default function Rating({ fileId, initialRatings }: { fileId: string; initialRatings: any[] }) {
  const { data: session } = useSession();
  const [ratings, setRatings] = useState(initialRatings || []);
  const [loading, setLoading] = useState(false);

  const userRating = ratings.find((r: any) => r.user === session?.user?.email)?.stars || 0;
  const average = ratings.length > 0 
    ? (ratings.reduce((acc: number, r: any) => acc + r.stars, 0) / ratings.length).toFixed(1) 
    : "0.0";

  const handleRate = async (stars: number) => {
    if (!session) return alert("Please login to rate");
    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars }),
      });
      const json = await res.json();
      if (json.success) {
        setRatings(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border rounded-lg bg-card text-card-foreground" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <h3 className="font-semibold mb-2">Rating</h3>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl font-bold">{average}</span>
        <span className="text-muted-foreground text-sm">({ratings.length} reviews)</span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            disabled={loading}
            className={`text-2xl ${star <= userRating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}
