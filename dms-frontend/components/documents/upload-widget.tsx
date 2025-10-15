"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadResult {
  name: string;
  status: string;
}

export function UploadWidget() {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [lastUpload, setLastUpload] = useState<UploadResult[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    try {
      setStatus("uploading");
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { uploads: UploadResult[] };
      setLastUpload(payload.uploads);
      setStatus("success");
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"]
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-44 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-800 bg-slate-900/60 text-center text-sm transition",
        isDragActive && "border-brand-400 bg-brand-500/10 text-brand-200"
      )}
    >
      <input {...getInputProps()} />
      {status === "uploading" ? (
        <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
      ) : (
        <UploadCloud className="h-8 w-8 text-brand-300" />
      )}
      <div>
        <p className="font-medium text-slate-200">Drop PDF documents here</p>
        <p className="text-xs text-slate-500">
          Supports POs, invoices, agreements • Max 25MB per file
        </p>
      </div>
      {status === "success" && lastUpload.length > 0 && (
        <div className="text-xs text-emerald-200">
          Queued {lastUpload.length} file(s) for ingest.
        </div>
      )}
      {status === "error" && (
        <div className="text-xs text-rose-300">Upload failed. Please try again.</div>
      )}
    </div>
  );
}
