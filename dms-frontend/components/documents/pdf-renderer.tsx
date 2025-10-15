"use client";

import { useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PdfRenderer({ fileUrl }: { fileUrl: string }) {
  useEffect(() => {
    // In production, prefer hosting the worker locally.
  }, []);

  return (
    <div className="h-[480px] overflow-y-auto bg-slate-950">
      <Document file={fileUrl} renderMode="canvas">
        <Page pageNumber={1} width={640} />
      </Document>
    </div>
  );
}
