"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ReportButton({ fileId }: { fileId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReport = async () => {
    if (!reason.trim()) return alert("Please provide a reason");
    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Report submitted successfully");
        setOpen(false);
        setReason("");
      } else {
        alert(json.message || "Failed to submit report");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting report");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-sm text-red-500 hover:underline mt-2">Report this file</button>
      </DialogTrigger>
      <DialogContent className="bg-card text-card-foreground" style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
        <DialogHeader>
          <DialogTitle>Report File</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <textarea
            className="w-full p-2 border rounded bg-background text-foreground"
            style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
            placeholder="Why are you reporting this file?"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <button
            onClick={handleReport}
            disabled={loading}
            className="w-full py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
