"use client";

import { AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AlertItem {
  id: string;
  title: string;
  description: string;
  level: "info" | "warning" | "critical";
  timestamp: string;
}

const iconByLevel = {
  info: { icon: CheckCircle2, className: "text-emerald-300" },
  warning: { icon: AlertCircle, className: "text-amber-300" },
  critical: { icon: ShieldAlert, className: "text-rose-300" }
};

export function AlertsFeed({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Alerts & Notifications</h3>
          <p className="text-sm text-slate-400">Automated thresholds surfaced in real time.</p>
        </div>
        <Link
          href="/alerts"
          className="text-sm font-medium text-brand-300 transition hover:text-brand-200"
        >
          Manage
        </Link>
      </div>
      <ScrollArea className="mt-6 h-64 pr-2">
        <ul className="space-y-3">
          {alerts.map((alert) => {
            const { icon: Icon, className } = iconByLevel[alert.level];
            return (
              <li
                key={alert.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200"
              >
                <div className="flex items-start gap-3">
                  <Icon className={`mt-1 h-5 w-5 ${className}`} />
                  <div>
                    <p className="font-semibold text-white">{alert.title}</p>
                    <p className="mt-1 text-slate-400">{alert.description}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </div>
  );
}
