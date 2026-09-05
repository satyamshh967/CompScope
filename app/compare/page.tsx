"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CompensationChart } from "@/app/components/compensation-chart";
import ThemeToggle from "@/app/components/theme-toggle";

type Compensation = {
  id: string;
  baseSalary: string | number;
  stock: string | number;
  bonus: string | number;
  totalCompensation: string | number;
  currency: string;
  yearsExperience?: string | number | null;

  company: {
    name: string;
  };

  role: {
    name: string;
  };

  level: {
    canonicalLevel: string;
  };

  location: {
    city: string;
    country: string;
  };
};

function formatSalary(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatLakhs(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(2)}Cr`;
  }

  return `₹${(value / 100_000).toFixed(2)}L`;
}

export default function ComparePage() {
  const [records, setRecords] = useState<Compensation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const ids = new URLSearchParams(
      window.location.search,
    ).get("ids");

    if (!ids) {
      setError("No compensation records selected.");
      setLoading(false);
      return;
    }

    // Capture the narrowed string value so TypeScript
    // keeps it as a string inside the async function.
    const selectedIds = ids;

    async function load() {
      try {
        const response = await fetch(
          `/api/compare?ids=${encodeURIComponent(selectedIds)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load comparison");
        }

        const result = await response.json();

        setRecords(result.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load comparison data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const insights = useMemo(() => {
    if (!records.length) {
      return null;
    }

    const highestTotal = [...records].sort(
      (a, b) =>
        Number(b.totalCompensation) -
        Number(a.totalCompensation),
    )[0];

    const highestBase = [...records].sort(
      (a, b) =>
        Number(b.baseSalary) -
        Number(a.baseSalary),
    )[0];

    const highestStock = [...records].sort(
      (a, b) =>
        Number(b.stock) -
        Number(a.stock),
    )[0];

    return {
      highestTotal,
      highestBase,
      highestStock,
    };
  }, [records]);

  const chartRecords = records.map((record) => ({
    name: record.company.name,
    base: Number(record.baseSalary),
    stock: Number(record.stock),
    bonus: Number(record.bonus),
    total: Number(record.totalCompensation),
  }));

  // Keep this explicitly typed as number | null.
  // This avoids TypeScript inferring number | false
  // from the previous && expression.
  const lead: number | null =
    insights && records.length > 1
      ? Number(insights.highestTotal.totalCompensation) -
        Math.min(
          ...records.map((record) =>
            Number(record.totalCompensation),
          ),
        )
      : null;

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16 text-sm text-muted">
          Loading comparison...
        </div>
      </main>
    );
  }

  if (error || !records.length) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <p className="text-sm text-danger">
            {error || "No comparison data found."}
          </p>

          <Link
            href="/"
            className="mt-5 inline-block text-sm text-accent hover:text-accent-hover"
          >
            ← Back to Explorer
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
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
              className="text-xs text-muted hover:text-foreground sm:text-sm"
            >
              Companies
            </Link>

            <span className="text-xs font-medium text-foreground sm:text-sm">
              Compare
            </span>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:pt-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
              Compensation comparison
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Compare selected offers
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Compare compensation structure across
              companies, with total compensation and
              equity separated from base salary.
            </p>
          </div>

          <Link
            href="/"
            className="text-sm text-accent hover:text-accent-hover"
          >
            ← Back to Explorer
          </Link>
        </div>
      </section>

      {/* Comparison insights */}
      {insights && (
        <section className="mx-auto max-w-7xl px-5 pb-7">
          <div className="grid gap-3 sm:grid-cols-3">
            {/* Highest total */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Highest total
              </p>

              <p className="mt-2 text-lg font-semibold">
                {insights.highestTotal.company.name}
              </p>

              <p className="mt-1 text-sm font-medium text-accent">
                {formatSalary(
                  insights.highestTotal.totalCompensation,
                )}
              </p>
            </div>

            {/* Highest base */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Highest base
              </p>

              <p className="mt-2 text-lg font-semibold">
                {insights.highestBase.company.name}
              </p>

              <p className="mt-1 text-sm font-medium text-accent">
                {formatSalary(
                  insights.highestBase.baseSalary,
                )}
              </p>
            </div>

            {/* Highest stock */}
            <div className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-wide text-muted">
                Highest stock
              </p>

              <p className="mt-2 text-lg font-semibold">
                {insights.highestStock.company.name}
              </p>

              <p className="mt-1 text-sm font-medium text-accent">
                {formatSalary(
                  insights.highestStock.stock,
                )}
              </p>
            </div>
          </div>

          {/* Lead insight */}
          {lead !== null && (
            <div className="mt-3 rounded-xl border border-accent/20 bg-accent-soft px-4 py-3 text-sm text-muted">
              <span className="font-medium text-foreground">
                {insights.highestTotal.company.name}
              </span>{" "}
              leads the selected records by{" "}
              <span className="font-medium text-accent">
                {formatLakhs(lead)}
              </span>{" "}
              in total compensation.
            </div>
          )}
        </section>
      )}

      {/* Charts */}
      <section className="mx-auto max-w-7xl px-5 pb-8">
        <CompensationChart records={chartRecords} />
      </section>

      {/* Comparison table */}
      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-border bg-surface-muted">
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="px-5 py-3.5 font-medium">
                    Metric
                  </th>

                  {records.map((record) => (
                    <th
                      key={record.id}
                      className="px-5 py-3.5 font-medium"
                    >
                      {record.company.name}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {/* Base */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Base salary
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4"
                    >
                      {formatSalary(record.baseSalary)}
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Stock
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4"
                    >
                      {formatSalary(record.stock)}
                    </td>
                  ))}
                </tr>

                {/* Bonus */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Bonus
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4"
                    >
                      {formatSalary(record.bonus)}
                    </td>
                  ))}
                </tr>

                {/* Total */}
                <tr className="bg-accent-soft">
                  <td className="px-5 py-4 font-semibold">
                    Total compensation
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4 font-semibold text-accent"
                    >
                      {formatSalary(
                        record.totalCompensation,
                      )}
                    </td>
                  ))}
                </tr>

                {/* Role */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Role
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4 text-muted-strong"
                    >
                      {record.role.name}
                    </td>
                  ))}
                </tr>

                {/* Level */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Level
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4 text-muted-strong"
                    >
                      {record.level.canonicalLevel}
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Location
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4 text-muted-strong"
                    >
                      {record.location.city}
                    </td>
                  ))}
                </tr>

                {/* Experience */}
                <tr>
                  <td className="px-5 py-4 font-medium">
                    Experience
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="px-5 py-4 text-muted-strong"
                    >
                      {record.yearsExperience != null
                        ? `${record.yearsExperience} years`
                        : "—"}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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