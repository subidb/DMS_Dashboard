"use client";

import { BellRing, Filter, Plus, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAlertsQuery } from "@/lib/queries";
import { useAuth } from "@/lib/auth/use-auth";

const alertLevels = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "warning", label: "Warning" },
  { value: "info", label: "Info" }
] as const;

const iconByLevel = {
  critical: { icon: ShieldAlert, badge: "danger" as const },
  warning: { icon: BellRing, badge: "warning" as const },
  info: { icon: ShieldCheck, badge: "info" as const }
};

export function AlertsCenter() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<(typeof alertLevels)[number]["value"]>("all");
  const { data, isLoading, isError, error } = useAlertsQuery();
  const { user } = useAuth();

  const filtered = useMemo(() => {
    const alerts = data ?? [];
    return alerts.filter((alert) => {
      const matchesLevel = level === "all" || alert.level === level;
      const matchesQuery =
        !query ||
        alert.title.toLowerCase().includes(query.toLowerCase()) ||
        alert.description.toLowerCase().includes(query.toLowerCase());
      return matchesLevel && matchesQuery;
    });
  }, [level, query, data]);

  const hasAccess = user.role === "admin" || user.role === "finance";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">Alerts & Automation</h1>
        <p className="text-sm text-slate-400">
          Configure guardrails for PO caps, expiries, and unmatched invoices.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30">
        {!hasAccess && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
            Alerts can be managed by finance or admin roles. You are currently logged in as {user.role}.
          </div>
        )}
        {isLoading && (
          <div className="mt-4 text-sm text-slate-300">Loading alerts...</div>
        )}
        {isError && (
          <div className="mt-4 text-sm text-rose-200">
            Unable to load alerts. {error instanceof Error ? error.message : null}
          </div>
        )}

        {hasAccess && !isError && (
          <>
            <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-slate-400" />
                <Input
                  className="lg:w-96"
                  placeholder="Search alerts..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                {alertLevels.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setLevel(option.value)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition",
                      level === option.value
                        ? "border-brand-500/40 bg-brand-500/20 text-brand-100"
                        : "border-slate-800 bg-slate-900/70 text-slate-300 hover:border-slate-700"
                    )}
                    type="button"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {filtered.map((alert) => {
                const meta = iconByLevel[alert.level];
                const Icon = meta.icon;
                return (
                  <div
                    key={alert.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-slate-800/80 p-2">
                        <Icon className="h-5 w-5 text-brand-200" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-white">{alert.title}</p>
                        <p className="mt-1 text-slate-400">{alert.description}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Last triggered {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={meta.badge}>{alert.level}</Badge>
                      <Button variant="secondary" className="text-xs uppercase tracking-wide">
                        Edit rule
                      </Button>
                      <Button variant="ghost" size="icon" className="text-slate-400">
                        <XCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {!filtered.length && !isLoading && (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
                  No alerts found. Adjust filters or create a new automation.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border border-brand-500/40 bg-brand-500/10 p-6 shadow-xl shadow-brand-900/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-100">
              Next step
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Add WhatsApp escalation flow</h2>
            <p className="mt-2 text-sm text-brand-50/70">
              Configure Twilio integration to send high severity alerts directly to the ops group.
            </p>
          </div>
          <Button className="bg-white text-slate-900 hover:bg-slate-100" type="button">
            <Plus className="mr-2 h-4 w-4" />
            New automation
          </Button>
        </div>
      </div>
    </div>
  );
}
