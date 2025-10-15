"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const PdfViewer = dynamic(() => import("./pdf-renderer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      Loading preview...
    </div>
  )
});

export function DocumentViewer({ url }: { url?: string }) {
  if (!url) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-400">
        No PDF available for preview. Upload via integrations or drag-and-drop.
      </div>
    );
  }

  return (
    <div className="h-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading preview...
          </div>
        }
      >
        <PdfViewer fileUrl={url} />
      </Suspense>
    </div>
  );
}
