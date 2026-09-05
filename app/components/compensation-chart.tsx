"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartRecord = {
  name: string;
  base: number;
  stock: number;
  bonus: number;
  total: number;
};

type Props = {
  records: ChartRecord[];
};

function formatCompact(value: number) {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLakhs(value: number) {
  return `₹${(value / 100_000).toFixed(1)}L`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const items = payload.filter(
    (item) => Number(item.value) > 0,
  );

  return (
    <div
      className="
        min-w-[190px]
        rounded-lg
        border
        border-border
        bg-surface
        px-3.5
        py-3
        shadow-lg
      "
    >
      <p className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </p>

      <div className="space-y-1.5">
        {items.map((item) => {
          const labels: Record<string, string> = {
            base: "Base salary",
            stock: "Stock",
            bonus: "Bonus",
            total: "Total compensation",
          };

          return (
            <div
              key={item.dataKey}
              className="flex items-center justify-between gap-5 text-xs"
            >
              <span className="text-muted">
                {labels[item.dataKey ?? ""] ??
                  item.dataKey}
              </span>

              <span className="font-medium text-foreground">
                {formatCurrency(Number(item.value))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function CompensationChart({
  records,
}: Props) {
  if (!records.length) {
    return null;
  }

  const highestTotal = Math.max(
    ...records.map((record) => record.total),
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* TOTAL COMPENSATION */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">
            Total compensation
          </h3>

          <p className="mt-1 text-xs text-muted">
            Total annual compensation for each selected
            record.
          </p>
        </div>

        <div className="h-[300px] p-4">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={records}
              layout="vertical"
              margin={{
                top: 8,
                right: 20,
                left: 8,
                bottom: 8,
              }}
            >
              <CartesianGrid
                horizontal={false}
                stroke="var(--border)"
              />

              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />

              <YAxis
                type="category"
                dataKey="name"
                width={82}
                tick={{
                  fill: "var(--foreground)",
                  fontSize: 12,
                }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                cursor={{
                  fill: "var(--accent-soft)",
                  opacity: 0.35,
                }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="total"
                name="Total compensation"
                radius={[0, 5, 5, 0]}
                barSize={34}
              >
                {records.map((record, index) => (
                  <Cell
                    key={`${record.name}-${index}`}
                    fill={
                      record.total === highestTotal
                        ? "var(--accent)"
                        : "var(--border-strong)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* COMPENSATION BREAKDOWN */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold">
            Compensation breakdown
          </h3>

          <p className="mt-1 text-xs text-muted">
            See how base, equity and bonus contribute to
            total compensation.
          </p>
        </div>

        <div className="px-5 pt-4">
          <div className="mb-2 flex flex-wrap items-center gap-4 text-[11px] text-muted">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-accent" />
              Base
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-success" />
              Stock
            </div>

            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm bg-danger" />
              Bonus
            </div>
          </div>
        </div>

        <div className="h-[250px] px-3 pb-4">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={records}
              margin={{
                top: 8,
                right: 10,
                left: 0,
                bottom: 8,
              }}
              barGap={5}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "var(--muted)",
                  fontSize: 11,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tickFormatter={formatCompact}
                tick={{
                  fill: "var(--muted)",
                  fontSize: 10,
                }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              <Tooltip
                cursor={{
                  fill: "var(--accent-soft)",
                  opacity: 0.25,
                }}
                content={<CustomTooltip />}
              />

              <Bar
                dataKey="base"
                name="Base salary"
                fill="var(--accent)"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />

              <Bar
                dataKey="stock"
                name="Stock"
                fill="var(--success)"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />

              <Bar
                dataKey="bonus"
                name="Bonus"
                fill="var(--danger)"
                radius={[4, 4, 0, 0]}
                barSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}