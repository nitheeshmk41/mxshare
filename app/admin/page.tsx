"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LoaderSpinner } from "@/components/loader";

type Tab = "files" | "reports" | "admins";
const SUPER_ADMIN_EMAIL = "25mx336@psgtech.ac.in";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>("files");
  const [files, setFiles] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Admin State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const isSuperAdmin = session?.user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (status === "loading") return;
    const userRole = (session as any)?.user?.role;
    if (!session || userRole !== "admin") {
      router.push("/");
      return;
    }
    fetchData();
  }, [session, status, router]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchFiles(), fetchReports(), fetchAdmins()]);
    setLoading(false);
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch("/api/search?q=");
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/admin/reports");
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const json = await res.json();
      if (json.success) {
        setAdmins(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteFile = async (fileId: string, reportId?: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      if (reportId) {
        const res = await fetch(`/api/admin/reports/${reportId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "accept" }),
        });
        const json = await res.json();
        if (json.success) {
          alert("File deleted and report resolved");
          fetchReports();
          fetchFiles();
        } else {
          alert(json.message || "Failed to action report");
        }
      } else {
        const res = await fetch(`/api/file/${fileId}`, { method: "DELETE" });
        const json = await res.json();
        if (json.success) {
          alert("File deleted successfully");
          fetchFiles();
        } else {
          alert(json.message || "Failed to delete file");
        }
      }
    } catch (err) {
      alert("Error deleting file");
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Report dismissed");
        fetchReports();
      } else {
        alert(json.message || "Failed to dismiss report");
      }
    } catch (err) {
      alert("Error resolving report");
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail.includes("@psgtech.ac.in")) {
      alert("Must be a psgtech.ac.in email");
      return;
    }

    setAddingAdmin(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newAdminEmail }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Admin added successfully");
        setNewAdminEmail("");
        fetchAdmins();
      } else {
        alert(json.message || "Failed to add admin");
      }
    } catch (err) {
      alert("Error adding admin");
    }
    setAddingAdmin(false);
  };

  const removeAdmin = async (email: string) => {
    if (!isSuperAdmin) {
      alert("Only the super admin can remove admins");
      return;
    }

    if (!confirm(`Remove admin access for ${email}?`)) {
      return;
    }

    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.success) {
        alert("Admin removed successfully");
        fetchAdmins();
      } else {
        alert(json.message || "Failed to remove admin");
      }
    } catch (err) {
      alert("Error removing admin");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoaderSpinner />
      </div>
    );
  }

  const maskIdentifier = (value?: string) => {
    if (!value) return "Anonymous";
    const [name] = value.split("@");
    return name || value;
  };

  const formatDate = (value?: string | number | Date) => {
    if (!value) return "";
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session?.user?.email}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
              {[
                { id: "files", label: "📁 Manage Files" },
                { id: "reports", label: "📋 Complaints" },
                { id: "admins", label: "👥 Admins" },
              ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`px-6 py-3 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? "border-b-2 border-primary text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "files" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">All Files ({files.length})</h2>
            </div>
            <div className="grid gap-4">
              {files.map((file) => {
                const ratings = Array.isArray(file.ratings) ? file.ratings : [];
                const comments = Array.isArray(file.comments) ? file.comments : [];
                const averageRating = ratings.length
                  ? ratings.reduce((sum: number, rating: { stars?: number }) => sum + (Number(rating?.stars) || 0), 0) /
                    ratings.length
                  : 0;

                return (
                  <div
                    key={file._id}
                    className="border border-border rounded-lg p-4 bg-card hover:border-primary/50 transition space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{file.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {file.subject} • {file.semester}
                        </p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                          <span>👁️ {file.views || 0} views</span>
                          <span>
                            ⭐ {averageRating.toFixed(1)} avg ({ratings.length})
                          </span>
                          <span>💬 {comments.length} comments</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a
                          href={`/file/${file._id}`}
                          target="_blank"
                          className="px-3 py-1.5 text-sm bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition"
                        >
                          View
                        </a>
                        <button
                          onClick={() => deleteFile(file._id)}
                          className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="border border-border rounded-lg p-3 bg-background/50">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>Ratings ({ratings.length})</span>
                          <span>{averageRating.toFixed(1)} ⭐</span>
                        </div>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                          {ratings.length ? (
                            ratings.map((rating: any, index: number) => (
                              <div
                                key={`${file._id}-rating-${rating?.user || index}`}
                                className="flex items-center justify-between text-xs bg-card/60 border border-border/60 rounded px-2 py-1"
                              >
                                <span className="text-muted-foreground">
                                  {maskIdentifier(typeof rating?.user === "string" ? rating.user : undefined)}
                                </span>
                                <span className="font-semibold">{Number(rating?.stars) || 0} ★</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No ratings yet</p>
                          )}
                        </div>
                      </div>

                      <div className="border border-border rounded-lg p-3 bg-background/50">
                        <div className="text-sm font-semibold">Comments ({comments.length})</div>
                        <div className="mt-3 space-y-2 max-h-40 overflow-y-auto pr-1">
                          {comments.length ? (
                            comments.map((comment: any, index: number) => (
                              <div
                                key={`${file._id}-comment-${index}`}
                                className="border border-border/60 rounded px-3 py-2 bg-card/60"
                              >
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                  <span>{comment?.author || "Anonymous"}</span>
                                  <span>{formatDate(comment?.createdAt)}</span>
                                </div>
                                <p className="text-sm mt-1 whitespace-pre-line">
                                  {comment?.text || "(no content)"}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">No comments yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">Complaint Box ({reports.length})</h2>
            {reports.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No complaints to review
              </div>
            ) : (
              <div className="grid gap-4">
                {reports.map((report) => {
                  const fileDoc = report.fileId && typeof report.fileId === "object" ? report.fileId : null;
                  const statusStyles = {
                    pending: "bg-yellow-500/10 text-yellow-500",
                    resolved: "bg-emerald-500/10 text-emerald-500",
                    dismissed: "bg-gray-500/10 text-gray-500",
                  } as Record<string, string>;

                  return (
                    <div
                      key={report._id}
                      className="border border-border rounded-lg p-4 bg-card"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded ${statusStyles[report.status] || "bg-muted text-muted-foreground"}`}>
                              {report.status.toUpperCase()}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(report.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Reported by {report.reporter}</p>
                            <p className="font-semibold text-base">{fileDoc?.title || "Unknown file"}</p>
                            <p className="text-sm">
                              Reason: <span className="text-muted-foreground">{report.reason}</span>
                            </p>
                            {fileDoc && (
                              <a
                                href={`/file/${fileDoc._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-500 hover:underline"
                              >
                                View File
                              </a>
                            )}
                          </div>
                        </div>

                        {report.status === "pending" && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => deleteFile(fileDoc?._id || report.fileId, report._id)}
                              className="px-3 py-1.5 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition whitespace-nowrap"
                            >
                              Accept • Remove File
                            </button>
                            <button
                              onClick={() => resolveReport(report._id)}
                              className="px-3 py-1.5 text-xs bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20 transition whitespace-nowrap"
                            >
                              Dismiss Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Add Admin */}
              <div className="border border-border rounded-lg p-6 bg-card">
                <h3 className="text-lg font-bold mb-4">➕ Add New Admin</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                      placeholder="email@psgtech.ac.in"
                    />
                  </div>
                  <button
                    onClick={addAdmin}
                    disabled={addingAdmin || !newAdminEmail}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {addingAdmin ? "Adding..." : "Add Admin"}
                  </button>
                </div>
              </div>
            </div>

            {/* Admin List */}
            <div className="border border-border rounded-lg p-6 bg-card">
              <h3 className="text-lg font-bold mb-4">Current Admins ({admins.length})</h3>
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div
                    key={admin._id}
                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{admin.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(admin.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {admin.email === "25mx336@psgtech.ac.in" && (
                        <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded">
                          Super Admin
                        </span>
                      )}
                      {isSuperAdmin && admin.email !== SUPER_ADMIN_EMAIL && (
                        <button
                          onClick={() => removeAdmin(admin.email)}
                          className="px-3 py-1 text-xs bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
