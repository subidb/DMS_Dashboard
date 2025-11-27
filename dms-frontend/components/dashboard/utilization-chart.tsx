"use client";

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function UtilizationChart({
  data
}: {
  data: Array<{ month: string; client: number; vendor: number }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Monthly Document Activity</h3>
          <p className="text-sm text-slate-400">
            Total document amounts created per month (in thousands).
          </p>
        </div>
      </div>
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorClient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVendor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" opacity={0.4} />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              cursor={{ strokeDasharray: "4 4" }}
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }}
              labelStyle={{ color: "#e2e8f0" }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="client"
              name="Client Documents"
              stroke="#38bdf8"
              fill="url(#colorClient)"
            />
            <Area
              type="monotone"
              dataKey="vendor"
              name="Vendor Documents"
              stroke="#a855f7"
              fill="url(#colorVendor)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
