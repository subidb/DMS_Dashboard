import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ExceptionItem {
  id: string;
  documentId: string;
  issue: string;
  severity: "low" | "medium" | "high";
  owner: string;
  raisedAt: string;
}

const severityStyles: Record<string, string> = {
  high: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
};

export function ExceptionsPanel({ exceptions }: { exceptions: ExceptionItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Exceptions Queue</h3>
          <p className="text-sm text-slate-400">
            Validation issues awaiting human-in-loop review.
          </p>
        </div>
        <Link
          href="/exceptions"
          className="text-sm font-medium text-brand-300 transition hover:text-brand-200"
        >
          View all
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {exceptions.map((exception) => (
          <div
            key={exception.id}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border",
                    severityStyles[exception.severity]
                  )}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{exception.issue}</p>
                  <p className="text-xs text-slate-400">
                    {exception.documentId} • Assigned to {exception.owner}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(exception.raisedAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
