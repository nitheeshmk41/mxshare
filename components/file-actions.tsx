"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  fileId: string;
  canEdit: boolean;
  canDelete: boolean;
  initialTitle: string;
  initialDriveUrl?: string;
  initialLinks?: string[];
}

export function FileActions({
  fileId,
  canEdit,
  canDelete,
  initialTitle,
  initialDriveUrl = "",
  initialLinks = [],
}: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [driveUrl, setDriveUrl] = useState(initialDriveUrl);
  const [linksText, setLinksText] = useState(initialLinks.join("\n"));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges = useMemo(() => {
    const normalizedLinks = linksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .join("\n");
    const initialNormalized = initialLinks.join("\n");
    return (
      title.trim() !== initialTitle.trim() ||
      driveUrl.trim() !== initialDriveUrl.trim() ||
      normalizedLinks !== initialNormalized
    );
  }, [title, driveUrl, linksText, initialTitle, initialDriveUrl, initialLinks]);

  async function handleSave() {
    if (!canEdit) return;
    setMessage(null);
    setError(null);
    if (!hasChanges) {
      setMessage("No changes to save.");
      return;
    }

    setSaving(true);
    const payload: Record<string, any> = {};

    if (title.trim() !== initialTitle.trim()) {
      payload.title = title.trim();
    }

    if (driveUrl.trim() !== initialDriveUrl.trim()) {
      payload.driveUrl = driveUrl.trim();
    }

    const normalizedLinks = linksText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (normalizedLinks.join("\n") !== initialLinks.join("\n")) {
      payload.resourceLinks = normalizedLinks.length ? normalizedLinks.join("\n") : [];
    }

    try {
      const res = await fetch(`/api/file/${fileId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Update failed");
      }
      setMessage("Saved successfully.");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!canDelete) return;

    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3500);
      return;
    }

    setDeleting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/file/${fileId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Delete failed");
      }
      router.push("/my-files");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Unable to delete");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  if (!canEdit && !canDelete) return null;

  return (
    <div className="mt-6 rounded-lg border p-4 bg-card" style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-semibold">Manage File</h3>
          <p className="text-xs text-muted-foreground">Edit title, links, or delete your upload.</p>
        </div>
        {canDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : confirmDelete ? "Click to confirm" : "Delete"}
          </Button>
        )}
      </div>

      {canEdit && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update title" />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Drive Link</label>
            <Input value={driveUrl} onChange={(e) => setDriveUrl(e.target.value)} placeholder="https://..." />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Resource Links (one per line)</label>
            <Textarea
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
              placeholder="https://example.com/resource"
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
            {message && <span className="text-sm text-green-600">{message}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
