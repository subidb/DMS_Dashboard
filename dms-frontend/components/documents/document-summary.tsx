import { Badge } from "@/components/ui/badge";
import type { DocumentRecord } from "@/lib/data/sample-data";

export function DocumentSummary({ document }: { document: DocumentRecord }) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Document</p>
          <h2 className="text-2xl font-semibold text-white">{document.title}</h2>
          <Badge className="mt-3">{document.category}</Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-semibold text-brand-200">{document.status}</p>
          <p className="mt-3 text-xs text-slate-500">Confidence</p>
          <p className="text-sm font-semibold text-slate-200">
            {Math.round(document.confidence * 100)}%
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Client</dt>
          <dd className="text-base text-slate-200">{document.client}</dd>
        </div>
        {document.vendor && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Vendor</dt>
            <dd className="text-base text-slate-200">{document.vendor}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Amount</dt>
          <dd className="text-base text-slate-200">
            {document.currency} {document.amount.toLocaleString()}
          </dd>
        </div>
        {document.dueDate && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Expiry</dt>
            <dd className="text-base text-slate-200">
              {new Date(document.dueDate).toLocaleDateString()}
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Created</dt>
          <dd className="text-base text-slate-200">
            {new Date(document.createdAt).toLocaleString()}
          </dd>
        </div>
        {document.linkedTo && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Linked Record</dt>
            <dd className="text-base text-brand-200">{document.linkedTo}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
