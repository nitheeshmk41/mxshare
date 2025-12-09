interface FileItem {
  _id?: string;
  title: string;
  subject?: string;
  semester?: string | number;
  hints?: string;
  driveUrl?: string;
  [key: string]: any;
}

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
};

import CommentsSection from "@/components/comments";
import ViewsCounter from "@/components/views";
import DownloadButton from "@/components/download-button";
import Rating from "@/components/rating";
import ReportButton from "@/components/report-button";
import AISummary from "@/components/ai-summary";
import ShareButton from "@/components/share-button";
import { FileActions } from "@/components/file-actions";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

export default async function FilePage({ params }: { params: any }) {
  const rawParams = params;
  const resolvedParams = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
  const id: string | undefined = resolvedParams?.id;

  const base = process.env.URL || "http://localhost:3000";
  const session = await getServerSession(authConfig as any);
  const userEmail = (session as any)?.user?.email as string | undefined;
  const userRole = (session as any)?.user?.role as string | undefined;

  let item: FileItem | null = null;

  if (!id) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">File Not Found</h1>
        <p className="text-muted-foreground mt-2">This file may have been deleted or moved.</p>
      </div>
    );
  }

  const res = await fetch(`${base}/api/file/${id}`, {
    cache: "no-store",
  });

  if (res.ok) {
    const json = (await res.json()) as ApiResponse<FileItem>;
    if (json.success && json.data) item = json.data;
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold">File Not Found</h1>
        <p className="text-muted-foreground mt-2">
          This file may have been deleted or moved.
        </p>
      </div>
    );
  }

  const ownerEmail = (item as any).authorEmail || "";
  const canEdit = !!userEmail && userEmail === ownerEmail;
  const canDelete = canEdit || userRole === "admin";

  return (
    <div
      className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen bg-background text-foreground"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <div
            className="bg-card rounded-lg shadow-sm p-4 md:p-6 border space-y-4"
            style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold leading-tight">{item.title}</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {item.subject} — Semester {item.semester}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Uploaded by: {item.author ?? "Anonymous"}
                  {item.authorEmail ? ` (${item.authorEmail})` : ""}
                </p>
              </div>

              <div className="shrink-0 text-sm text-muted-foreground sm:text-right space-y-1">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/80">Views</span>
                  <span className="font-semibold"><ViewsCounter fileId={item._id || id} initial={item.views ?? 0} /></span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground/80">Downloads</span>
                  <span className="font-semibold">{item.downloads ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <DownloadButton fileId={item._id || id} driveUrl={item.driveUrl || ""} />
              <ShareButton fileId={item._id || id} title={`${item.title} - ${item.subject || 'MXShare'}`} />
            </div>

            {(canEdit || canDelete) && (
              <FileActions
                fileId={item._id || id}
                canEdit={canEdit}
                canDelete={canDelete}
                initialTitle={item.title}
                initialDriveUrl={item.driveUrl || ""}
                initialLinks={Array.isArray(item.resourceLinks) ? item.resourceLinks : []}
              />
            )}

            {item.hints && (
              <p className="text-sm text-muted-foreground">Notes: {item.hints}</p>
            )}

            {Array.isArray(item.resourceLinks) && item.resourceLinks.length > 0 && (
              <div className="rounded-md border p-3" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-base font-semibold mb-2">Additional Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.resourceLinks.map((link: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 break-all">
                      <span className="mt-1 text-primary">•</span>
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <CommentsSection fileId={item._id || id} initialComments={undefined} uploaderEmail={(item as any).authorEmail} />
        </div>

        <div className="space-y-4">
          <div
            className="bg-card rounded-lg shadow-sm p-4 border"
            style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Quick actions</span>
              <ReportButton fileId={item._id || id} />
            </div>
          </div>

          <Rating fileId={item._id || id} initialRatings={item.ratings || []} />

          <AISummary fileId={item._id || id} initialSummary={item.aiSummary} />
        </div>
      </div>
    </div>
  );
}
