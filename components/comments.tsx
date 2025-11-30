"use client";
import React from "react";
import { useSession } from "next-auth/react";

type Comment = {
  author?: string;
  text: string;
  createdAt?: string;
  _id?: string;
};

export default function CommentsSection({ fileId, initialComments, uploaderEmail }: { fileId: string; initialComments?: Comment[]; uploaderEmail?: string }) {
  const [comments, setComments] = React.useState<Comment[]>(initialComments || []);
  const [author, setAuthor] = React.useState("");
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If no initialComments were provided, fetch them from the API
    if (!initialComments) {
      (async () => {
        try {
          const res = await fetch(`/api/file/${fileId}/comments`);
          const json = await res.json();
          if (res.ok && json.success) setComments(json.data || []);
        } catch (err) {
          // ignore
        }
      })();
    }
  }, [fileId, initialComments]);

  // prefill author from session if available
  const { data: session } = useSession();
  React.useEffect(() => {
    const email = (session as any)?.user?.email;
    if (email && !author) {
      setAuthor(email.split("@")[0] || email);
    }
  }, [session]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!text.trim()) return setError("Please enter a comment");
    setLoading(true);
    try {
      const res = await fetch(`/api/file/${fileId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author || "Anonymous", text: text.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json?.message || "Failed to post");
      setComments(Array.isArray(json.data) ? json.data.map((c: any) => ({ ...c, createdAt: c.createdAt })) : comments);
      setText("");
    } catch (err: any) {
      setError(err.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg md:text-xl font-semibold">Comments</h3>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <input
          className="w-full p-3 border rounded bg-card text-card-foreground"
          style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          readOnly={!!(session as any)?.user?.email}
        />
        <textarea
          className="w-full p-3 border rounded bg-card text-card-foreground"
          style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
        />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <button 
            className="w-full sm:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-medium disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post comment"}
          </button>
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {comments.length === 0 && <div className="text-sm text-muted-foreground p-4 bg-card rounded border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>No comments yet. Be the first to comment!</div>}
        {comments.map((c, i) => {
          const canDelete = (session as any)?.user?.email ? ((session as any).user.email.split("@")[0] === c.author) || ((session as any).user.email === uploaderEmail) : false;
          return (
            <div 
              key={c._id || i} 
              className="border rounded p-4 bg-card text-card-foreground shadow-sm"
              style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-sm font-medium">{c.author || "Anonymous"}</div>
                <div className="text-xs text-muted-foreground">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                </div>
              </div>
              <p className="mt-2 text-sm break-words">{c.text}</p>
              {canDelete && (
                <div className="mt-3 text-right">
                  <button
                    className="text-sm text-red-600 dark:text-red-400 hover:underline"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/file/${fileId}/comments/${c._id}`, { method: "DELETE" });
                        const json = await res.json();
                        if (res.ok && json.success) setComments(json.data || []);
                      } catch (err) {
                        // ignore
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
