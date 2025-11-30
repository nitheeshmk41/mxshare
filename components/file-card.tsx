type File = {
  _id: string;
  title: string;
  subject?: string;
  semester?: number | string;
  hints?: string;
  views?: number;
};

export default function FileCard({ file }: { file: File }) {
  return (
    <a
      href={`/file/${file._id}`}
      className="block md:flex md:items-start md:justify-between w-full bg-card text-card-foreground rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700"
      style={{ background: "var(--card)", color: "var(--card-foreground)" }}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-lg md:text-xl">{file.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 md:text-base">{file.subject} • Sem {file.semester}</p>
        {file.hints && <p className="text-xs md:text-sm mt-3 text-muted-foreground">{file.hints}</p>}
      </div>

      <div className="mt-3 md:mt-0 md:ml-4 text-right text-sm text-muted-foreground">
        <div className="hidden md:block">Views: {file.views ?? 0}</div>
        <div className="block md:hidden">Views: {file.views ?? 0}</div>
      </div>
    </a>
  );
}
