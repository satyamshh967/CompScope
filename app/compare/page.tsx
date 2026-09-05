"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/theme-toggle";

type Compensation = {
  id: number;
  baseSalary: number | string;
  stock: number | string;
  bonus: number | string;
  totalCompensation: number | string;
  currency: string;
  yearsExperience?: number | null;

  company: {
    id: number;
    name: string;
  };

  role: {
    id: number;
    name: string;
  };

  level: {
    id: number;
    name: string;
    canonicalLevel?: string;
  };

  location: {
    id: number;
    city: string;
    country: string;
  };
};

function formatSalary(value: number | string, currency = "INR") {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "—";
  }

  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  }

  return `${currency} ${amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

export default function ComparePage() {
  const searchParams = useSearchParams();

  const [records, setRecords] = useState<Compensation[]>([]);
  const [ids, setIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const queryIds = searchParams.get("ids") ?? "";

    setIds(queryIds);

    if (!queryIds) {
      setRecords([]);
      return;
    }

    async function fetchComparison() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/compare?ids=${encodeURIComponent(queryIds)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load comparison");
        }

        const result = await response.json();

        const data =
          result.data ??
          result.records ??
          result.compensations ??
          result;

        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load the comparison.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [searchParams]);

  function handleManualCompare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(",");

    if (!cleanedIds) {
      setRecords([]);
      return;
    }

    window.history.pushState({}, "", `/compare?ids=${cleanedIds}`);

    window.location.href = `/compare?ids=${cleanedIds}`;
  }

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Navigation */}
      <nav className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <Link href="/" className="group">
            <div className="text-2xl font-bold tracking-tight">
              Comp<span className="text-accent">Scope</span>
            </div>

            <div className="text-sm text-muted">
              Compensation Intelligence
            </div>
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              Explorer
            </Link>

            <Link
              href="/companies"
              className="text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              Companies
            </Link>

            <Link
              href="/compare"
              className="text-sm font-medium text-accent"
            >
              Compare
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-8 py-16">
        {/* Header */}
        <div className="mb-12 max-w-3xl">
          <div className="mb-5 inline-flex rounded-full border border-accent/20 bg-accent-soft px-4 py-2 text-sm font-medium text-accent">
            Compensation Comparison
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Compare compensation
            <br />
            <span className="text-accent">side by side.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Compare base salary, stock, bonus and total compensation across
            different companies, roles and levels.
          </p>
        </div>

        {/* Manual ID input */}
        <form
          onSubmit={handleManualCompare}
          className="
            mb-12
            max-w-3xl
            rounded-2xl
            border
            border-border
            bg-surface
            p-6
          "
        >
          <label
            htmlFor="record-ids"
            className="mb-2 block text-sm font-medium text-muted"
          >
            COMPENSATION RECORD IDS
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="record-ids"
              type="text"
              value={ids}
              onChange={(event) => setIds(event.target.value)}
              placeholder="Example: 1, 2, 3"
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-border
                bg-background
                px-5
                py-4
                text-[15px]
                text-foreground
                placeholder:text-muted
                transition-all
                duration-200
                focus:border-accent
                focus:ring-4
                focus:ring-accent-soft
              "
            />

            <button
              type="submit"
              className="
                rounded-xl
                bg-accent
                px-6
                py-4
                font-semibold
                text-white
                transition-all
                duration-200
                hover:bg-accent-hover
                active:scale-[0.98]
                cursor-pointer
              "
            >
              Compare
            </button>
          </div>

          <p className="mt-3 text-sm text-muted">
            Enter up to 3 compensation record IDs separated by commas.
          </p>
        </form>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-muted">Loading comparison...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* No records */}
        {!loading && !error && records.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="mb-4 text-4xl">⇄</div>

            <h2 className="text-2xl font-semibold">
              Select compensation records to compare
            </h2>

            <p className="mx-auto mt-3 max-w-lg text-muted">
              Go to the Explorer, select up to three records, and compare
              their compensation side by side.
            </p>

            <Link
              href="/"
              className="
                mt-6
                inline-flex
                rounded-xl
                bg-accent
                px-6
                py-3
                font-semibold
                text-white
                transition-colors
                hover:bg-accent-hover
              "
            >
              Open Explorer
            </Link>
          </div>
        )}

        {/* Comparison */}
        {!loading && !error && records.length > 0 && (
          <div className="space-y-8">
            {/* Summary cards */}
            <div className="grid gap-5 md:grid-cols-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="
                    rounded-2xl
                    border
                    border-border
                    bg-surface
                    p-6
                  "
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-lg bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent">
                      {record.level.name}
                    </span>

                    <span className="text-xs text-muted">
                      #{record.id}
                    </span>
                  </div>

                  <h2 className="mt-5 text-xl font-semibold">
                    {record.company.name}
                  </h2>

                  <p className="mt-1 text-sm text-muted">
                    {record.role.name}
                  </p>

                  <p className="mt-1 text-sm text-muted">
                    {record.location.city}, {record.location.country}
                  </p>

                  <div className="mt-6 border-t border-border pt-5">
                    <p className="text-sm text-muted">
                      Total Compensation
                    </p>

                    <p className="mt-1 text-3xl font-bold text-accent">
                      {formatSalary(
                        record.totalCompensation,
                        record.currency
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed comparison */}
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-6 py-5">
                <h2 className="text-xl font-semibold">
                  Compensation Breakdown
                </h2>

                <p className="mt-1 text-sm text-muted">
                  Compare the components that make up total compensation.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-5 text-left text-sm font-semibold text-muted">
                        Metric
                      </th>

                      {records.map((record) => (
                        <th
                          key={record.id}
                          className="px-6 py-5 text-left text-sm font-semibold"
                        >
                          <div>{record.company.name}</div>

                          <div className="mt-1 font-normal text-muted">
                            {record.level.name} · {record.role.name}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-border">
                      <td className="px-6 py-5 text-sm font-medium">
                        Base Salary
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-sm"
                        >
                          {formatSalary(
                            record.baseSalary,
                            record.currency
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="px-6 py-5 text-sm font-medium">
                        Stock
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-sm"
                        >
                          {formatSalary(record.stock, record.currency)}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="px-6 py-5 text-sm font-medium">
                        Bonus
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-sm"
                        >
                          {formatSalary(record.bonus, record.currency)}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border bg-accent-soft/40">
                      <td className="px-6 py-5 text-sm font-bold">
                        Total Compensation
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-base font-bold text-accent"
                        >
                          {formatSalary(
                            record.totalCompensation,
                            record.currency
                          )}
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-border">
                      <td className="px-6 py-5 text-sm font-medium">
                        Location
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-sm"
                        >
                          {record.location.city},{" "}
                          {record.location.country}
                        </td>
                      ))}
                    </tr>

                    <tr>
                      <td className="px-6 py-5 text-sm font-medium">
                        Experience
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className="px-6 py-5 text-sm"
                        >
                          {record.yearsExperience != null
                            ? `${record.yearsExperience} years`
                            : "Not specified"}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Back to explorer */}
            <div>
              <Link
                href="/"
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-accent
                  transition-colors
                  hover:text-accent-hover
                "
              >
                ← Back to Explorer
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}