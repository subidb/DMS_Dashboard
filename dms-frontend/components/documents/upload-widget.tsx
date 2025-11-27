"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, UploadCloud, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadResult {
  name: string;
  status: string;
  location?: string;
}

export function UploadWidget() {
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "success" | "error">("idle");
  const [lastUpload, setLastUpload] = useState<UploadResult[]>([]);
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const processingFilesRef = useRef<Set<string>>(new Set());
  const isProcessingRef = useRef(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    
    // Prevent duplicate processing
    if (isProcessingRef.current) {
      console.log("Upload already in progress, skipping duplicate call");
      return;
    }
    
    try {
      isProcessingRef.current = true;
      setStatus("uploading");
      const formData = new FormData();
      acceptedFiles.forEach((file) => formData.append("files", file));

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const payload = (await response.json()) as { uploads: UploadResult[] };
      setLastUpload(payload.uploads);
      
      // Automatically process PDFs after upload (only once per file)
      const filesToProcess = payload.uploads.filter(u => u.status === "queued" && u.location);
      if (filesToProcess.length > 0) {
        setStatus("processing");
        setProcessingStatus(`Processing ${filesToProcess.length} file(s)...`);
      } else {
        setStatus("success");
      }
      
      let processedCount = 0;
      let errorCount = 0;
      
      for (const upload of filesToProcess) {
        if (upload.location) {
          const filename = upload.location.split('/').pop();
          if (filename && !processingFilesRef.current.has(filename)) {
            // Mark as processing to prevent duplicates
            processingFilesRef.current.add(filename);
            
            try {
              setProcessingStatus(`Processing ${filename}...`);
              const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/uploads/process/${encodeURIComponent(filename)}`, {
                method: "POST"
              });
              
              if (!processResponse.ok) {
                const errorData = await processResponse.json();
                // Check if it's an "already exists" case - this is not an error
                if (errorData.already_exists) {
                  console.log(`ℹ️  Document already processed: ${filename}`);
                  processedCount++; // Count as processed since it already exists
                } else {
                  console.error("PDF processing failed:", errorData.detail || errorData.error);
                  errorCount++;
                }
              } else {
                const result = await processResponse.json();
                // Check if document already existed
                if (result.already_exists) {
                  console.log(`ℹ️  Document already exists: ${filename} - ${result.message || 'Skipped duplicate processing'}`);
                  processedCount++;
                } else {
                  console.log(`✅ Successfully processed: ${filename}`);
                  processedCount++;
                }
                
                // Invalidate queries to refresh dashboard immediately (even for existing docs)
                queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                queryClient.invalidateQueries({ queryKey: ["documents"] });
                queryClient.invalidateQueries({ queryKey: ["alerts"] });
                queryClient.invalidateQueries({ queryKey: ["exceptions"] });
              }
            } catch (error) {
              console.error("PDF processing failed:", error);
              errorCount++;
            } finally {
              // Remove from processing set after a delay
              setTimeout(() => {
                processingFilesRef.current.delete(filename);
              }, 10000);
            }
          } else if (processingFilesRef.current.has(filename)) {
            console.log(`⏭️  Skipping duplicate processing for: ${filename}`);
          }
        }
      }
      
      // Update status after all processing
      if (filesToProcess.length > 0) {
        if (errorCount > 0) {
          setStatus("error");
          setProcessingStatus(`${processedCount} processed, ${errorCount} failed`);
        } else {
          setStatus("success");
          const skippedCount = filesToProcess.length - processedCount;
          if (skippedCount > 0) {
            setProcessingStatus(`${processedCount} processed, ${skippedCount} already existed`);
          } else {
            setProcessingStatus(`${processedCount} file(s) processed successfully`);
          }
          
          // Auto-reset to idle after 3 seconds
          setTimeout(() => {
            setStatus("idle");
            setProcessingStatus("");
          }, 3000);
        }
      }
    } catch (error) {
      console.error("Upload failed", error);
      setStatus("error");
    } finally {
      isProcessingRef.current = false;
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
      {status === "uploading" || status === "processing" ? (
        <Loader2 className="h-8 w-8 animate-spin text-brand-300" />
      ) : status === "success" ? (
        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
      ) : (
        <UploadCloud className="h-8 w-8 text-brand-300" />
      )}
      <div>
        <p className="font-medium text-slate-200">
          {status === "uploading" ? "Uploading files..." :
           status === "processing" ? "Processing documents..." :
           status === "success" ? "Upload successful!" :
           "Drop PDF documents here"}
        </p>
        <p className="text-xs text-slate-500">
          {status === "processing" || status === "success" ? processingStatus :
           "Supports POs, invoices, agreements • Max 25MB per file"}
        </p>
      </div>
      {status === "success" && processingStatus && (
        <div className="text-xs text-emerald-200">
          {processingStatus}
        </div>
      )}
      {status === "error" && (
        <div className="text-xs text-rose-300">
          {processingStatus || "Upload failed. Please try again."}
        </div>
      )}
    </div>
  );
}
