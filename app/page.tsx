import Hero from "@/components/hero";
import SearchBar from "@/components/search-bar";
import FileCard from "@/components/file-card";

export default async function Home() {
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
    <main>
      <Hero />

      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <SearchBar />
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">Best Files</h2>
        {files.length === 0 ? (
          <div className="p-6 bg-neutral-50 rounded-md text-center">No files yet — try uploading one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {files.map((f: any) => (
              <FileCard key={f._id} file={f} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
