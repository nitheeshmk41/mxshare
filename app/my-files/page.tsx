"use client";

import { useEffect, useState } from "react";
import FileCard from "@/components/file-card";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type FileData = {
  _id: string;
  title: string;
  subject: string;
  semester: string;
  [key: string]: any;
};

export default function MyFilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/my-files")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setFiles(data.data);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [status]);

  // Group by Subject (Topic)
  const filteredFiles = files.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase()) ||
    f.subject.toLowerCase().includes(search.toLowerCase())
  );

  const groupedFiles = filteredFiles.reduce((acc, file) => {
    const subject = file.subject || "Uncategorized";
    if (!acc[subject]) acc[subject] = [];
    acc[subject].push(file);
    return acc;
  }, {} as Record<string, FileData[]>);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Files</h1>
        <input
          type="text"
          placeholder="Search my files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-64 bg-background"
          style={{ borderColor: "var(--border)" }}
        />
      </div>

      {Object.keys(groupedFiles).length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg border border-dashed">
          <p className="text-muted-foreground">No files found.</p>
          <a href="/upload" className="text-primary hover:underline mt-2 inline-block">Upload a file</a>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFiles).map(([subject, subjectFiles]) => (
            <div key={subject}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span>
                {subject}
                <span className="text-sm font-normal text-muted-foreground ml-2">({subjectFiles.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjectFiles.map((file) => (
                  <FileCard key={file._id} file={file} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
