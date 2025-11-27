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

export default async function FilePage({ params }: { params: any }) {
  // `params` can be a Promise in some Next versions. Resolve it first.
  const rawParams = params;
  const resolvedParams = rawParams && typeof rawParams.then === "function" ? await rawParams : rawParams;
  const id: string | undefined = resolvedParams?.id;

  const base = process.env.URL || "http://localhost:3000";

  let item: FileItem | null = null;

  if (!id) {
    // no id available
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
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{item.title}</h1>
      <p className="text-sm text-muted-foreground mt-2">
        {item.subject} — Semester {item.semester}
      </p>

      <a
        href={item.driveUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded"
      >
        Download
      </a>

      {item.hints && (
        <p className="mt-4 text-sm text-muted-foreground">Notes: {item.hints}</p>
      )}
    </div>
  );
}
