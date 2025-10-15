"use client";

import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface KpiItem {
  label: string;
  value: string;
  delta: string;
  helper: string;
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((kpi) => {
        const isPositive = kpi.delta.startsWith("+");
        const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
        return (
          <motion.div
            key={kpi.label}
            className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            <p className="text-sm font-medium text-slate-400">{kpi.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-3xl font-semibold text-white">{kpi.value}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                  isPositive
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-rose-500/10 text-rose-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {kpi.delta}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{kpi.helper}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
