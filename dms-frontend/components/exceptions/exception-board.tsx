"use client";

import { AlertTriangle, CheckCircle2, Clock, UserCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDocumentsQuery, useExceptionsQuery } from "@/lib/queries";

const severityOrder = ["high", "medium", "low"] as const;

export function ExceptionBoard() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof severityOrder)[number] | "all">("all");
  const {
    data: exceptions,
    isLoading,
    isError,
    error
  } = useExceptionsQuery();
  const { data: documents } = useDocumentsQuery();

  const enriched = useMemo(() => {
    const term = query.toLowerCase();
    const exceptionList = exceptions ?? [];
    const documentList = documents ?? [];

    return exceptionList
      .filter((item) => {
        const matchesSeverity = filter === "all" || item.severity === filter;
        const document = documentList.find((doc) => doc.id === item.documentId);
        const matchesDoc =
          !query ||
          item.documentId.toLowerCase().includes(term) ||
          item.issue.toLowerCase().includes(term) ||
          (document?.client.toLowerCase().includes(term) ?? false);
        return matchesSeverity && matchesDoc;
      })
      .map((item) => ({
        ...item,
        document: documentList.find((doc) => doc.id === item.documentId)
      }));
  }, [query, filter, exceptions, documents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">Exception Workspace</h1>
        <p className="text-sm text-slate-400">
          Prioritize validation failures and assign owners for resolution.
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Input
          className="lg:w-96"
          placeholder="Search by document ID, issue, client..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className="flex gap-2">
          {(["all", ...severityOrder] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition",
                filter === value
                  ? "border-brand-500/40 bg-brand-500/20 text-brand-100"
                  : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700"
              )}
              type="button"
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-5 text-sm text-slate-300">
          Loading exceptions...
        </div>
      )}
      {isError && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-200">
          Unable to load exceptions. {error instanceof Error ? error.message : null}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-3">
        {severityOrder.map((severity) => (
          <div
            key={severity}
            className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-300" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                  {severity} severity
                </h2>
              </div>
              <Badge variant={severity === "high" ? "danger" : severity === "medium" ? "warning" : "info"}>
                {enriched.filter((item) => item.severity === severity).length} open
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {enriched
                .filter((item) => item.severity === severity)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">{item.issue}</p>
                        <p className="mt-1 text-xs text-slate-400">
                          {item.documentId} • {item.document?.title ?? "Unknown"}
                        </p>
                      </div>
                      <Badge variant="info">{item.owner}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(item.raisedAt).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCircle className="h-3.5 w-3.5" />
                        Finance Ops Queue
                      </span>
                    </div>
                  </div>
                ))}
              {!enriched.filter((item) => item.severity === severity).length && (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-400">
                  No {severity} severity exceptions.
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 shadow-xl shadow-emerald-900/20">
          <div className="flex items-center gap-3 text-emerald-100">
            <CheckCircle2 className="h-6 w-6" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide">Automation Coverage</p>
              <p className="text-xs">
                87% of documents pass validation on first attempt. Triage the remaining 13%.
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-xs text-emerald-100">
            <p>• Configure additional matching rules in Settings → Automations.</p>
            <p>• Enable WhatsApp alerts for high severity items to accelerate remediation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
