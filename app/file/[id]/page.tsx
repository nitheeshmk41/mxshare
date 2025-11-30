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

export default async function FilePage({ params }: { params: any }) {
  const rawParams = params;
  const resolvedParams = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
  const id: string | undefined = resolvedParams?.id;

  const base = process.env.URL || "http://localhost:3000";

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

  return (
    <div 
      className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen bg-background text-foreground"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div 
            className="bg-card rounded-lg shadow-sm p-4 md:p-6 border"
            style={{ background: "var(--card)", color: "var(--card-foreground)", borderColor: "var(--border)" }}
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-bold">{item.title}</h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                  {item.subject} — Semester {item.semester}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Uploaded by: {item.author ?? "Anonymous"}
                  {item.authorEmail ? ` (${item.authorEmail})` : ""}
                </p>
              </div>

              <div className="text-sm text-muted-foreground md:text-right">
                <div>Views: <ViewsCounter fileId={item._id || id} initial={item.views ?? 0} /></div>
                <div className="mt-1">Downloads: {item.downloads ?? 0}</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-6">
              <DownloadButton fileId={item._id || id} driveUrl={item.driveUrl || ""} />
              <ShareButton fileId={item._id || id} title={`${item.title} - ${item.subject || 'MXShare'}`} />
            </div>

            {item.hints && (
              <p className="mt-4 text-sm text-muted-foreground">Notes: {item.hints}</p>
            )}
          </div>

          <AISummary fileId={item._id || id} initialSummary={item.aiSummary} />
          
          <CommentsSection fileId={item._id || id} initialComments={undefined} uploaderEmail={(item as any).authorEmail} />
        </div>

        <div className="md:col-span-1">
          <Rating fileId={item._id || id} initialRatings={item.ratings || []} />
          <div className="mt-4 text-center">
            <ReportButton fileId={item._id || id} />
          </div>
        </div>
      </div>
    </div>
  );
}
