import { LoaderSpinner } from "@/components/loader";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <LoaderSpinner />
    </div>
  );
}
