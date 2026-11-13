"use client";

import { useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { applicationStatuses, statusLabels } from "@/lib/validators";

type Status = (typeof applicationStatuses)[number];
type StatusData = { status: Status; count: number };
type MonthlyData = { month: string; count: number };

const chartColors: Record<Status, string> = {
  dikirim: "#2563EB",
  psikotes: "#8B5CF6",
  wawancara: "#F59E0B",
  diterima: "#10B981",
  ditolak: "#EF4444",
};

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  timeZone: "Asia/Jakarta",
});

export function DashboardCharts({
  statuses,
  monthly,
}: {
  statuses: StatusData[];
  monthly: MonthlyData[];
}) {
  const shouldReduceMotion = useReducedMotion();
  const animationDuration = shouldReduceMotion ? 0 : 700;
  const statusChartData = statuses.map((item) => ({
    ...item,
    name: statusLabels[item.status],
    fill: chartColors[item.status],
  }));
  const monthlyChartData = monthly.map((item) => ({
    ...item,
    label: monthFormatter.format(new Date(`${item.month}-01T00:00:00+07:00`)),
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="rounded-2xl border border-slate-200 bg-surface p-5 dark:border-slate-700 lg:col-span-2">
        <h2 className="font-semibold">Distribusi status</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={92}
                paddingAngle={3}
                animationDuration={animationDuration}
              >
                {statusChartData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {statusChartData.map((item) => (
            <div key={item.status} className="flex items-center gap-2 text-xs text-muted">
              <span className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
              {item.name}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-surface p-5 dark:border-slate-700 lg:col-span-3">
        <h2 className="font-semibold">Lamaran per bulan</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                name="Lamaran"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                animationDuration={animationDuration}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
