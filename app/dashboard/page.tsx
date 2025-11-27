import FileCard from "@/components/file-card";

export default async function Dashboard() {
  const base = process.env.URL || "http://localhost:3000";
  let files: any[] = [];
  try {
    const res = await fetch(`${base}/api/search?q=`, { cache: "no-store" });
    if (res.ok) {
      try {
        files = await res.json();
      } catch (err) {
        files = [];
      }
    }
  } catch (err) {
    files = [];
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <a href="/upload" className="btn">Upload File</a>
      </div>

      {files.length === 0 ? (
        <div className="p-6 bg-neutral-50 rounded-md text-center">No files yet. Be the first to upload!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {files.map((f: any) => (
            <FileCard key={f._id} file={f} />
          ))}
        </div>
      )}
    </div>
  );
}
