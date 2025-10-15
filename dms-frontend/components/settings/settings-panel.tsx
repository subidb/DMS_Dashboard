"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ServerCog, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/lib/auth/use-auth";

export function SettingsPanel() {
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const isAdmin = user.role === "admin";

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSaving(false);
    // TODO: integrate with backend API.
  };

  if (!isAdmin) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-white">Platform Settings</h1>
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-100">
          Settings are restricted to administrators. Switch roles via the profile menu to make changes.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-white">Platform Settings</h1>
        <p className="text-sm text-slate-400">
          Manage ingestion integrations, access control, and automation defaults.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
          <div className="flex items-center gap-3">
            <ServerCog className="h-6 w-6 text-brand-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Integrations</h2>
              <p className="text-sm text-slate-400">
                Configure ingest channels connected to the classification pipeline.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Gmail Alias</label>
              <Input placeholder="finance-ops@embglobal.com" className="mt-2" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Shared Drive</label>
              <Input placeholder="gs://emb-dms-intake" className="mt-2" />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">WhatsApp Number</label>
              <Input placeholder="+1 (555) 012-4455" className="mt-2" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-brand-200" />
            <div>
              <h2 className="text-lg font-semibold text-white">Access Control</h2>
              <p className="text-sm text-slate-400">
                Role-based permissions mapped across finance, marketing, and admins.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Default Role</label>
              <Select className="mt-2">
                <option>Finance</option>
                <option>Marketing</option>
                <option>Admin</option>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Session Timeout</label>
              <Select className="mt-2">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>4 hours</option>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">MFA Provider</label>
              <Select className="mt-2">
                <option>Auth0</option>
                <option>AWS Cognito</option>
                <option>Okta</option>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
        <h2 className="text-lg font-semibold text-white">Automation Defaults</h2>
        <p className="text-sm text-slate-400">
          Use thresholds to reduce manual follow-up on PO utilization and expiries.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">
              PO cap warning
            </label>
            <Select className="mt-2">
              <option>75%</option>
              <option>80%</option>
              <option>90%</option>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">
              PO cap critical
            </label>
            <Select className="mt-2">
              <option>90%</option>
              <option>95%</option>
              <option>100%</option>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">
              Expiry notifications
            </label>
            <Select className="mt-2">
              <option>30 days</option>
              <option>60 days</option>
              <option>90 days</option>
            </Select>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">
              Exception auto-assign
            </label>
            <Select className="mt-2">
              <option>Finance Ops</option>
              <option>Compliance</option>
              <option>Shared Queue</option>
            </Select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            <span>Last synced with backend rules engine 12 minutes ago.</span>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
