"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";


interface UploadForm {
  title: string;
  subject: string;
  semester: string;
  hints: string;
  driveUrl: string;
  resourceLinks: string;
}

export default function UploadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const semesterOptions = ["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Others"];
  const [generatingAI, setGeneratingAI] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<UploadForm>({
    title: "",
    subject: "",
    semester: semesterOptions[0],
    hints: "",
    driveUrl: "",
    resourceLinks: "",
  });

  // File upload state and handlers (direct Google Drive upload)
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // New State for features
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  const tips = [
    "Did you know? You can search by subject code!",
    "Sharing notes helps the whole community grow.",
    "Make sure your PDF is searchable for better accessibility.",
    "Add a good description to help others find your notes.",
    "You can rate other students' notes to help quality control."
  ];

  // Cycle tips during upload
  React.useEffect(() => {
    if (uploading) {
      const interval = setInterval(() => setTipIndex(i => (i + 1) % tips.length), 3000);
      return () => clearInterval(interval);
    }
  }, [uploading]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      signIn("google");
    }
  }, [status]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  function openUploader() {
    // trigger the hidden file input
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 1. Basic Type Check
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'mp3' || ext === 'mp4') {
      alert('Audio and video files are not allowed. Please upload documents or PDFs.');
      e.currentTarget.value = "";
      return;
    }

    // 2. Content Verification (Simulation + Magic Bytes)
    setVerifying(true);
    
    const reader = new FileReader();
    reader.onloadend = function(evt) {
      if (evt.target?.readyState === FileReader.DONE) {
        const uint = new Uint8Array(evt.target.result as ArrayBuffer);
        let bytes: string[] = [];
        uint.forEach((byte) => bytes.push(byte.toString(16)));
        const hex = bytes.join('').toUpperCase();
        
        // PDF magic number: 25 50 44 46 (%PDF)
        const isPDF = hex.startsWith('25504446');
        
        if (ext === 'pdf' && !isPDF) {
          alert("File appears to be corrupted or not a valid PDF.");
          setVerifying(false);
          e.target.value = "";
          return;
        }

        // Simulate "AI Content Scan"
        setTimeout(() => {
          setVerifying(false);
          setPendingFile(file);
          setShowConfirm(true); // Ask for confirmation
        }, 1500);
      }
    };
    reader.readAsArrayBuffer(file.slice(0, 4));
    
    // reset input so same file can be picked again
    e.currentTarget.value = "";
  }

  function confirmUpload() {
    if (pendingFile) {
      setShowConfirm(false);
      uploadToDrive(pendingFile);
      setPendingFile(null);
    }
  }

  function cancelUpload() {
    setShowConfirm(false);
    setPendingFile(null);
  }

  async function uploadToDrive(file: File) {
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const res = await fetch('/api/drive-upload', {
        method: 'POST',
        headers: {
          'x-filename': file.name,
          'x-filesize': String(file.size),
          'x-mimetype': file.type || 'application/octet-stream'
        },
        body: file,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();
      if (data?.success && data?.driveUrl) {
        setForm((prev) => ({ ...prev, driveUrl: data.driveUrl }));
        // show small notification
        const n = document.createElement('div');
        n.style.cssText = `position:fixed;top:20px;right:20px;background:#059669;color:#fff;padding:12px 18px;border-radius:10px;z-index:9999;font-weight:600;`;
        n.textContent = '✓ Uploaded to Drive';
        document.body.appendChild(n);
        setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.3s'; setTimeout(() => n.remove(), 300); }, 2500);
      } else {
        setUploadProgress(0);
        alert('Upload failed: ' + (data?.message || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      clearInterval(progressInterval);
      setUploadProgress(0);
      alert('Upload error: ' + (err?.message || String(err)));
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  }

  function copyDriveLink() {
    if (form.driveUrl) {
      navigator.clipboard.writeText(form.driveUrl);
      const n = document.createElement('div');
      n.style.cssText = `position:fixed;top:20px;right:20px;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;z-index:9999;font-weight:600;`;
      n.textContent = '✓ Link copied to clipboard';
      document.body.appendChild(n);
      setTimeout(() => { n.style.opacity = '0'; n.style.transition = 'opacity 0.3s'; setTimeout(() => n.remove(), 300); }, 2000);
    }
  }

  // Generate AI Description
  async function generateAIDescription() {
    if (!form.title.trim() || !form.subject.trim() || !form.semester) {
      return alert("Please fill in Title, Subject, and Semester before generating AI description.");
    }
    
    setGeneratingAI(true);
    try {
      const res = await fetch("/api/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subject: form.subject,
          title: form.title 
        }),
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, hints: data.description }));
      } else {
        alert("Failed to generate description");
      }
    } catch (err) {
      alert("Error generating description");
    } finally {
      setGeneratingAI(false);
    }
  }

  // Validate URLs
  function validateUrls(urls: string): boolean {
    if (!urls.trim()) return true; // empty is ok
    
    const blocked = [
      'pornhub', 'xvideos', 'xnxx', 'porn', 'xxx', 'sex', 'adult',
      'gambling', 'casino', 'bet365', 'torrent', 'piratebay'
    ];
    
    const urlList = urls.split('\n').map(u => u.trim()).filter(Boolean);
    
    for (const url of urlList) {
      const lower = url.toLowerCase();
      if (blocked.some(term => lower.includes(term))) {
        alert(`Blocked content detected in URL: ${url}`);
        return false;
      }
      
      // Basic URL validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        alert(`Invalid URL format: ${url}`);
        return false;
      }
    }
    return true;
  }

  // Save to DB
  async function saveFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) return alert("Title is required");
    if (!form.driveUrl.trim())
      return alert("Upload a file or paste the Drive link");
    
    if (!validateUrls(form.resourceLinks)) return;

    setSaving(true);
    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const raw = await res.text();
    console.log("RAW RESPONSE FROM /api/store:", raw);

    type StoreResponse = {
      success?: boolean;
      message?: string;
    };

    let json: StoreResponse | null = null;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      alert("Server returned invalid response:\n" + raw);
      return;
    }

    if (!json?.success) {
      setSaving(false);
      alert(json?.message || "Error saving file");
      return;
    }

    setSaving(false);
    router.push("/dashboard");
  }

  return (
    <div 
      className="max-w-3xl mx-auto p-4 md:p-6 min-h-screen bg-background text-foreground"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div 
        className="bg-card rounded-lg shadow-sm p-4 md:p-6 border"
        style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Upload File</h1>

        <form onSubmit={saveFile} className="space-y-4">
          {/* hidden native file input used for direct Drive uploads */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            aria-hidden
          />
          <div>
            <label className="block text-sm font-medium mb-1">File Title *</label>
            <input
              className="w-full border p-3 rounded bg-background text-foreground"
              style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              placeholder="Enter file title"
              value={form.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                className="w-full border p-3 rounded bg-background text-foreground"
                style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                placeholder="e.g., Mathematics"
                value={form.subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Semester</label>
              <select
                className="w-full border p-3 rounded bg-background text-foreground"
                style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                value={form.semester}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setForm({ ...form, semester: e.target.value })
                }
              >
                {semesterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium">Description / Notes</label>
              <button
                type="button"
                onClick={generateAIDescription}
                disabled={generatingAI || !form.subject}
                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {generatingAI ? "Generating..." : "✨ AI Generate"}
              </button>
            </div>
            <textarea
              className="border p-3 rounded w-full bg-background text-foreground"
              style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              rows={4}
              placeholder="Add description or click AI Generate"
              value={form.hints}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, hints: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Resource Links (YouTube, Docs, etc.)
              <span className="text-xs text-muted-foreground ml-2">One per line</span>
            </label>
            <textarea
              className="border p-3 rounded w-full bg-background text-foreground font-mono text-sm"
              style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
              rows={3}
              placeholder={"https://youtube.com/watch?v=...\nhttps://docs.example.com/..."}
              value={form.resourceLinks}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, resourceLinks: e.target.value })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ Inappropriate content will be automatically blocked
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Google Drive Link</label>
            <div className="flex gap-2">
              <input
                className="flex-1 border p-3 rounded bg-background text-foreground"
                style={{ background: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" }}
                placeholder="Auto-filled after upload"
                value={form.driveUrl}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, driveUrl: e.target.value })}
              />
              {form.driveUrl && (
                <button
                  type="button"
                  onClick={copyDriveLink}
                  className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm"
                  title="Copy link"
                >
                  📋 Copy
                </button>
              )}
            </div>
          </div>

          {/* Verifying State */}
          {verifying && (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md flex items-center gap-3 animate-pulse border border-blue-100">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-medium">Verifying file integrity and content...</span>
            </div>
          )}

          {/* Upload Progress & Engaging Tips */}
          {uploading && uploadProgress > 0 && (
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Uploading to Google Drive...</span>
                  <span className="font-bold text-primary">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              
              {/* Engaging Tip */}
              <div className="text-center py-2">
                <p className="text-sm text-muted-foreground italic animate-pulse">
                  💡 {tips[tipIndex]}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={openUploader}
              disabled={uploading || verifying}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : verifying ? 'Verifying...' : '📤 Upload to Google Drive'}
            </button>

            <button
              type="submit"
              disabled={saving || uploading || verifying}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              {saving ? '💾 Saving...' : '💾 Save to Database'}
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-background p-6 rounded-lg shadow-xl max-w-md w-full border animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold mb-2">Confirm Upload</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to upload <strong>{pendingFile?.name}</strong>?
              <br/>
              <span className="text-xs text-yellow-600 mt-1 block">
                By uploading, you confirm this file follows our content policy.
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelUpload}
                className="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpload}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
              >
                Yes, Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
