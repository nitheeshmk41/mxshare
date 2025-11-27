type File = {
  _id: string;
  title: string;
  subject?: string;
  semester?: number | string;
  hints?: string;
};

export default function FileCard({ file }: { file: File }) {
  return (
    <a href={`/file/${file._id}`} className="block border rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-neutral-900">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg">{file.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{file.subject} • Sem {file.semester}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {/* placeholder for badges like downloads or created date */}
        </div>
      </div>

      {file.hints && <p className="text-xs mt-3 text-muted-foreground">{file.hints}</p>}
    </a>
  );
}
