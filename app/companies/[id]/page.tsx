"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ThemeToggle from "@/app/components/theme-toggle";

type LevelAnalytics = {
  level: string;
  records: number;
  averageBase: number;
  averageStock: number;
  averageBonus: number;
  averageTotal: number;
};

type RoleAnalytics = {
  role: string;
  records: number;
  averageTotal: number;
};

type LocationAnalytics = {
  location: string;
  records: number;
  averageTotal: number;
};

type AnalyticsResponse = {
  company: {
    id: string;
    name: string;
  };

  summary: {
    records: number;
    roles: number;
    levels: number;
    locations: number;
    averageBase: number;
    averageStock: number;
    averageBonus: number;
    averageTotal: number;
    highestTotal: number;
  };

  byLevel: LevelAnalytics[];
  byRole: RoleAnalytics[];
  byLocation: LocationAnalytics[];
};

function formatSalary(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number) {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-3.5 py-3 shadow-lg">
      <p className="mb-2 text-sm font-semibold text-foreground">
        {label}
      </p>

      <div className="space-y-1.5">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="text-muted">
              {item.name}
            </span>

            <span className="font-medium text-foreground">
              {formatSalary(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [analytics, setAnalytics] =
    useState<AnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const { id } = await params;

        const response = await fetch(
          `/api/companies/${id}/analytics`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load company analytics",
          );
        }

        const result =
          (await response.json()) as AnalyticsResponse;

        setAnalytics(result);
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load company intelligence.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [params]);

  const highestLevel = useMemo(() => {
    if (!analytics?.byLevel.length) {
      return null;
    }

    return [...analytics.byLevel].sort(
      (a, b) => b.averageTotal - a.averageTotal,
    )[0];
  }, [analytics]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-muted">
          Loading company intelligence...
        </div>
      </main>
    );
  }

  if (error || !analytics) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-sm text-danger">
            {error || "Company not found."}
          </p>

          <Link
            href="/companies"
            className="mt-5 inline-block text-sm text-accent hover:text-accent-hover"
          >
            ← Back to Companies
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* NAVIGATION */}
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5">
          <Link href="/" className="min-w-0">
            <div className="text-base font-semibold tracking-tight">
              Comp<span className="text-accent">Scope</span>
            </div>

            <div className="hidden text-[11px] text-muted sm:block">
              Compensation intelligence
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              href="/"
              className="text-xs text-muted hover:text-foreground sm:text-sm"
            >
              Explorer
            </Link>

            <Link
              href="/companies"
              className="text-xs font-medium text-foreground sm:text-sm"
            >
              Companies
            </Link>

            <Link
              href="/compare"
              className="text-xs text-muted hover:text-foreground sm:text-sm"
            >
              Compare
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10">
        <Link
          href="/companies"
          className="text-xs text-muted hover:text-accent"
        >
          ← All companies
        </Link>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
            Company intelligence
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {analytics.company.name}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Compensation patterns across levels, roles and
            locations. Levels are treated as the primary
            comparison dimension.
          </p>
        </div>
      </section>

      {/* DATA NOTICE */}
      <section className="mx-auto max-w-7xl px-5 pb-5">
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-xs leading-5 text-muted">
          <span className="font-medium text-foreground">
            Demo dataset:
          </span>{" "}
          Compensation records shown here are synthetic
          data created for demonstration purposes. They
          should not be interpreted as verified market
          compensation.
        </div>
      </section>

      {/* SUMMARY */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              Records
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.summary.records}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              Avg. total
            </p>

            <p className="mt-2 text-xl font-semibold">
              {formatCompact(
                analytics.summary.averageTotal,
              )}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              Levels
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.summary.levels}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              Roles
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.summary.roles}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">
              Locations
            </p>

            <p className="mt-2 text-xl font-semibold">
              {analytics.summary.locations}
            </p>
          </div>
        </div>
      </section>

      {/* LEVEL INSIGHT */}
      {highestLevel && (
        <section className="mx-auto max-w-7xl px-5 pb-8">
          <div className="rounded-xl border border-accent/20 bg-accent-soft px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              Level insight
            </p>

            <p className="mt-2 text-sm leading-6 text-foreground">
              <span className="font-semibold">
                {highestLevel.level}
              </span>{" "}
              has the highest average total compensation
              in this dataset at{" "}
              <span className="font-semibold text-accent">
                {formatSalary(
                  highestLevel.averageTotal,
                )}
              </span>
              .
            </p>

            <p className="mt-1 text-xs text-muted">
              Based on {highestLevel.records} compensation
              records.
            </p>
          </div>
        </section>
      )}

      {/* LEVEL CHART */}
      <section className="mx-auto max-w-7xl px-5 pb-5">
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              Compensation by level
            </h2>

            <p className="mt-1 text-xs text-muted">
              Average total compensation increases across
              seniority levels.
            </p>
          </div>

          <div className="h-[340px] p-4 sm:h-[380px]">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={analytics.byLevel}
                margin={{
                  top: 10,
                  right: 15,
                  left: 5,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="var(--border)"
                />

                <XAxis
                  dataKey="level"
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
                  width={55}
                />

                <Tooltip
                  cursor={{
                    fill: "var(--accent-soft)",
                    opacity: 0.25,
                  }}
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey="averageTotal"
                  name="Average total"
                  fill="var(--accent)"
                  radius={[5, 5, 0, 0]}
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* LEVEL BREAKDOWN */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              Level compensation breakdown
            </h2>

            <p className="mt-1 text-xs text-muted">
              Average compensation components by level.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">
                    Level
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Records
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Avg. base
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Avg. stock
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Avg. bonus
                  </th>

                  <th className="px-5 py-3.5 font-medium">
                    Avg. total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {analytics.byLevel.map((level) => (
                  <tr
                    key={level.level}
                    className="transition-colors hover:bg-surface-muted"
                  >
                    <td className="px-5 py-4 font-semibold">
                      {level.level}
                    </td>

                    <td className="px-5 py-4 text-muted">
                      {level.records}
                    </td>

                    <td className="px-5 py-4">
                      {formatSalary(level.averageBase)}
                    </td>

                    <td className="px-5 py-4">
                      {formatSalary(level.averageStock)}
                    </td>

                    <td className="px-5 py-4">
                      {formatSalary(level.averageBonus)}
                    </td>

                    <td className="px-5 py-4 font-semibold text-accent">
                      {formatSalary(level.averageTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ROLE + LOCATION */}
      <section className="mx-auto grid max-w-7xl gap-4 px-5 pb-12 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              Compensation by role
            </h2>

            <p className="mt-1 text-xs text-muted">
              Average total compensation across roles.
            </p>
          </div>

          <div className="divide-y divide-border">
            {analytics.byRole
              .slice(0, 6)
              .map((role) => (
                <div
                  key={role.role}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {role.role}
                    </p>

                    <p className="mt-0.5 text-xs text-muted">
                      {role.records} records
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-accent">
                    {formatCompact(role.averageTotal)}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-sm font-semibold">
              Compensation by location
            </h2>

            <p className="mt-1 text-xs text-muted">
              Average total compensation across locations.
            </p>
          </div>

          <div className="divide-y divide-border">
            {analytics.byLocation
              .slice(0, 6)
              .map((location) => (
                <div
                  key={location.location}
                  className="flex items-center justify-between gap-4 px-5 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {location.location}
                    </p>

                    <p className="mt-0.5 text-xs text-muted">
                      {location.records} records
                    </p>
                  </div>

                  <span className="shrink-0 text-sm font-semibold text-accent">
                    {formatCompact(
                      location.averageTotal,
                    )}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-xs text-muted">
        CompScope · Synthetic demo dataset · Compensation
        intelligence
      </footer>
    </main>
  );
}