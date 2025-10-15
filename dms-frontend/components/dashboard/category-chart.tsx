"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";

interface CategoryItem {
  name: string;
  value: number;
  fill: string;
}

export function CategoryChart({ data }: { data: CategoryItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-900/60 bg-slate-900/70 p-6 shadow-xl shadow-slate-950/30">
      <h3 className="text-lg font-semibold text-white">Documents by Type</h3>
      <p className="text-sm text-slate-400">
        Distribution of ingested items across classification categories.
      </p>
      <div className="mt-6 flex items-center justify-center">
        <PieChart width={340} height={240}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} stroke="#0f172a" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              borderColor: "#1e293b",
              color: "#e2e8f0"
            }}
          />
        </PieChart>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {data.map((entry) => (
          <li key={entry.name} className="flex items-center justify-between rounded-md bg-slate-800/60 px-3 py-2">
            <span>{entry.name}</span>
            <span className="font-medium">{entry.value} docs</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
