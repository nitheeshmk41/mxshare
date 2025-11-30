"use client";
import React from "react";

export default function ViewsCounter({ fileId, initial }: { fileId: string; initial?: number }) {
  const [count, setCount] = React.useState<number>(initial ?? 0);

  React.useEffect(() => {
    const key = `viewed:${fileId}`;
    if (sessionStorage.getItem(key)) return; // already counted this session

    (async () => {
      try {
        const res = await fetch(`/api/file/${fileId}/view`, { method: "POST" });
        if (res.ok) {
          setCount((c) => c + 1);
          sessionStorage.setItem(key, "1");
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [fileId]);

  return <>{count}</>;
}
