"use client";

import Link from "next/link";
import { FileStack, ArrowRight, AlertTriangle, ShieldCheck, Settings } from "lucide-react";
import { useDashboardQuery } from "@/lib/queries";
import { AlertsFeed } from "@/components/dashboard/alerts-feed";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { ExceptionsPanel } from "@/components/dashboard/exceptions-panel";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { UtilizationChart } from "@/components/dashboard/utilization-chart";
import { UploadWidget } from "@/components/documents/upload-widget";

export function DashboardScreen() {
  const { data, isLoading, isError, error } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 text-sm text-slate-300">
        Loading dashboard insights...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
        Unable to load dashboard insights. {error instanceof Error ? error.message : null}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">Operations Pulse</h1>
        <p className="text-sm text-slate-400">
          Track intake velocity, spending utilization, and outstanding exceptions in real time.
        </p>
      </div>
      
      {/* Quick Upload Section */}
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-white">Quick Document Upload</h2>
          <p className="text-sm text-slate-400">
            Drop PDF documents here to start processing POs, invoices, and agreements.
          </p>
        </div>
        <UploadWidget />
      </div>

      {/* Quick Navigation */}
      <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-white">Quick Actions</h2>
          <p className="text-sm text-slate-400">
            Navigate to key sections of your DMS dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            href="/documents" 
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
              <FileStack className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Documents</p>
              <p className="text-xs text-slate-400">View all documents</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-400" />
          </Link>
          
          <Link 
            href="/exceptions" 
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Exceptions</p>
              <p className="text-xs text-slate-400">Review issues</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-400" />
          </Link>
          
          <Link 
            href="/alerts" 
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Alerts</p>
              <p className="text-xs text-slate-400">View notifications</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-400" />
          </Link>
          
          <Link 
            href="/settings" 
            className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-800/40 p-4 transition hover:border-brand-500/40 hover:bg-brand-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-500/20 text-slate-400">
              <Settings className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-white">Settings</p>
              <p className="text-xs text-slate-400">Configure system</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-brand-400" />
          </Link>
        </div>
      </div>
      
      <KpiGrid items={data.kpis} />
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UtilizationChart data={data.utilizationTrend} />
        </div>
        <CategoryChart data={data.categorySplit} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ExceptionsPanel exceptions={data.exceptions.slice(0, 4)} />
        <AlertsFeed alerts={data.alerts.slice(0, 5)} />
      </div>
    </div>
  );
}
