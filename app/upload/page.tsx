"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const GAS_URL =
  "https://script.google.com/macros/s/AKfycbwV216yOM3DbR65w3tgDwM0oJaMJsPnnpjH_EL-cmrfSXUfe-NuFIGvV0TEoAi2T_lW/exec";

interface UploadForm {
  title: string;
  subject: string;
  semester: string;
  hints: string;
  driveUrl: string;
}

export default function UploadPage() {
  const router = useRouter();

  const [form, setForm] = useState<UploadForm>({
    title: "",
    subject: "",
    semester: "",
    hints: "",
    driveUrl: "",
  });

  // Listen for Google Apps Script popup message
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (e.data?.driveUrl) {
        setForm((prev) => ({
          ...prev,
          driveUrl: e.data.driveUrl,
        }));
      }
    }
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // Open GAS uploader
  function openUploader() {
    const redirect = `${window.location.origin}/upload`;

    window.open(
      `${GAS_URL}?redirect=${encodeURIComponent(redirect)}`,
      "_blank",
      "width=600,height=700"
    );
  }

  // Save to DB
  async function saveFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!form.title.trim()) return alert("Title is required");
    if (!form.driveUrl.trim())
      return alert("Upload a file or paste the Drive link");

    const res = await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const raw = await res.text();
    console.log("RAW RESPONSE FROM /api/store:", raw);

    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (err) {
      alert("Server returned invalid response:\n" + raw);
      return;
    }

    if (!json.success) {
      alert(json.message || "Error saving file");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Upload File</h1>

      <form onSubmit={saveFile} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="File Title"
          value={form.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Subject"
            value={form.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, subject: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Semester"
            value={form.semester}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, semester: e.target.value })}
          />
        </div>

        <textarea
          className="border p-2 rounded w-full"
          rows={3}
          placeholder="Hints / notes"
          value={form.hints}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, hints: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded"
          placeholder="Google Drive link (auto-filled)"
          value={form.driveUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, driveUrl: e.target.value })}
        />

        <button
          type="button"
          onClick={openUploader}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow"
        >
          Upload File (GAS)
        </button>

        <button
          type="submit"
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save
        </button>
      </form>
    </div>
  );
}
