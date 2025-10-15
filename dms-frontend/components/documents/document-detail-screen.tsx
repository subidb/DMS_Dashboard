"use client";

import { useMemo } from "react";
import { useDocumentQuery } from "@/lib/queries";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { DocumentSummary } from "@/components/documents/document-summary";
import { Badge } from "@/components/ui/badge";

export function DocumentDetailScreen({ id }: { id: string }) {
  const { data, isLoading, isError, error } = useDocumentQuery(id);

  const extractedFields = useMemo(() => {
    if (!data?.document) return [];
    const { document } = data;
    return [
      { label: "PO / Invoice Number", value: document.id, confidence: 0.99 },
      { label: "Client", value: document.client, confidence: 0.96 },
      {
        label: "Vendor",
        value: document.vendor ?? "—",
        confidence: document.vendor ? 0.92 : 0
      },
      {
        label: "Amount",
        value: `${document.currency} ${document.amount.toLocaleString()}`,
        confidence: 0.93
      },
      {
        label: "Due Date",
        value: document.dueDate ? new Date(document.dueDate).toLocaleDateString() : "—",
        confidence: document.dueDate ? 0.88 : 0
      }
    ];
  }, [data]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 text-sm text-slate-300">
        Loading document details...
      </div>
    );
  }

  if (isError || !data?.document) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
        Unable to load document. {error instanceof Error ? error.message : null}
      </div>
    );
  }

  const { document, relatedExceptions } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">{document.title}</h1>
        <p className="text-sm text-slate-400">
          Review extracted metadata, linked records, and validation status.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
        <DocumentSummary document={document} />
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
            <h3 className="text-lg font-semibold text-white">Extracted Metadata</h3>
            <p className="text-sm text-slate-400">OCR and LLM outputs with confidence scoring.</p>
            <dl className="mt-4 space-y-4 text-sm text-slate-200">
              {extractedFields.map((field) => (
                <div key={field.label} className="flex items-center justify-between gap-6">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-base text-slate-100">{field.value}</dd>
                  </div>
                  {field.confidence > 0 ? (
                    <Badge
                      className="whitespace-nowrap"
                      variant={field.confidence > 0.9 ? "success" : "warning"}
                    >
                      {Math.round(field.confidence * 100)}%
                    </Badge>
                  ) : (
                    <Badge className="whitespace-nowrap" variant="danger">
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-400">
            <p className="font-semibold text-slate-200">Workflow Activity</p>
            <ul className="mt-3 space-y-2">
              <li>• Ingested via Gmail integration.</li>
              <li>• Classified automatically as {document.category}.</li>
              <li>• Metadata validated with {Math.round(document.confidence * 100)}% confidence.</li>
              <li>• Linked to record {document.linkedTo ?? "—"}.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
          <h3 className="text-lg font-semibold text-white">Preview</h3>
          <p className="text-sm text-slate-400">Render provided PDF or upload to replace.</p>
          <div className="mt-4 h-[480px]">
            <DocumentViewer url={document.pdfUrl} />
          </div>
        </div>
        <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
          <h3 className="text-lg font-semibold text-white">Validation History</h3>
          <p className="text-sm text-slate-400">
            Review exception status and assign follow-ups to team members.
          </p>
          <div className="mt-4 space-y-4">
            {relatedExceptions.length ? (
              relatedExceptions.map((issue) => (
                <div key={issue.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">{issue.issue}</p>
                    <Badge
                      variant={
                        issue.severity === "high"
                          ? "danger"
                          : issue.severity === "medium"
                          ? "warning"
                          : "info"
                      }
                    >
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Raised {new Date(issue.raisedAt).toLocaleString()} • Owner: {issue.owner}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 p-6 text-sm text-emerald-200">
                No open exceptions. This document passed automated validation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
