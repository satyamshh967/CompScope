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
  };

  location: {
    id: number;
    city: string;
    country: string;
  };
};

function formatSalary(value: number | string, currency = "INR") {
  const amount = Number(value);

  if (Number.isNaN(amount)) return "—";

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
        setError("Unable to load comparison.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    fetchComparison();
  }, [searchParams]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleaned = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(",");

    if (!cleaned) {
      window.location.href = "/compare";
      return;
    }

    window.location.href = `/compare?ids=${cleaned}`;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="text-[21px] font-bold tracking-tight">
              Comp<span className="text-accent">Scope</span>
            </div>

            <span className="hidden border-l border-border pl-3 text-xs text-muted md:block">
              Compensation Intelligence
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link
                href="/"
                className="py-[25px] text-sm font-medium text-muted hover:text-foreground"
              >
                Explorer
              </Link>

              <Link
                href="/companies"
                className="py-[25px] text-sm font-medium text-muted hover:text-foreground"
              >
                Companies
              </Link>

              <Link
                href="/compare"
                className="border-b-2 border-accent py-[25px] text-sm font-medium text-foreground"
              >
                Compare
              </Link>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        {/* Heading */}
        <section className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Compensation Analysis
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Compare Compensation
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Compare compensation components across up to three records.
          </p>
        </section>

        {/* Manual input */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 border-y border-border py-6"
        >
          <label
            htmlFor="record-ids"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Record IDs
          </label>

          <div className="flex max-w-2xl gap-3">
            <input
              id="record-ids"
              value={ids}
              onChange={(event) => setIds(event.target.value)}
              placeholder="Example: 1, 2, 3"
              className="
                h-11
                min-w-0
                flex-1
                rounded-lg
                border
                border-border
                bg-surface
                px-4
                text-sm
                text-foreground
                placeholder:text-muted
                focus:border-accent
                focus:ring-2
                focus:ring-accent-soft
              "
            />

            <button
              type="submit"
              className="
                rounded-lg
                bg-accent
                px-5
                text-sm
                font-semibold
                text-white
                hover:bg-accent-hover
              "
            >
              Compare
            </button>
          </div>

          <p className="mt-2 text-xs text-muted">
            Enter up to three compensation record IDs.
          </p>
        </form>

        {loading && (
          <div className="border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
            Loading comparison...
          </div>
        )}

        {!loading && error && (
          <div className="border border-danger/30 bg-surface px-6 py-10 text-center text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && !error && records.length === 0 && (
          <div className="border border-border bg-surface px-6 py-12 text-center">
            <h2 className="text-lg font-semibold">
              No comparison selected
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Select records from the Explorer to compare compensation side
              by side.
            </p>

            <Link
              href="/"
              className="mt-5 inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Open Explorer
            </Link>
          </div>
        )}

        {!loading && !error && records.length > 0 && (
          <section>
            {/* Record headers */}
            <div
              className={`grid gap-px border border-border bg-border ${
                records.length === 1
                  ? "md:grid-cols-1"
                  : records.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-3"
              }`}
            >
              {records.map((record) => (
                <div
                  key={record.id}
                  className="bg-surface px-6 py-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">
                        {record.company.name}
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        {record.role.name}
                      </p>
                    </div>

                    <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                      {record.level.name}
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-muted">
                    {record.location.city},{" "}
                    {record.location.country}
                  </p>

                  <p className="mt-6 text-xs uppercase tracking-wide text-muted">
                    Total Compensation
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {formatSalary(
                      record.totalCompensation,
                      record.currency
                    )}
                  </p>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="mt-8 overflow-x-auto border border-border bg-surface">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Metric
                    </th>

                    {records.map((record) => (
                      <th
                        key={record.id}
                        className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted"
                      >
                        {record.company.name}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {[
                    ["Base Salary", "baseSalary"],
                    ["Stock", "stock"],
                    ["Bonus", "bonus"],
                    ["Total Compensation", "totalCompensation"],
                  ].map(([label, key]) => (
                    <tr
                      key={key}
                      className={`
                        border-b border-border
                        ${
                          key === "totalCompensation"
                            ? "bg-accent-soft/40"
                            : ""
                        }
                      `}
                    >
                      <td className="px-5 py-5 text-sm font-medium">
                        {label}
                      </td>

                      {records.map((record) => (
                        <td
                          key={record.id}
                          className={`
                            px-5
                            py-5
                            text-right
                            text-sm
                            tabular-nums
                            ${
                              key === "totalCompensation"
                                ? "font-bold text-accent"
                                : ""
                            }
                          `}
                        >
                          {formatSalary(
                            record[key as keyof Compensation] as
                              | number
                              | string,
                            record.currency
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}

                  <tr className="border-b border-border">
                    <td className="px-5 py-5 text-sm font-medium">
                      Location
                    </td>

                    {records.map((record) => (
                      <td
                        key={record.id}
                        className="px-5 py-5 text-right text-sm text-muted-strong"
                      >
                        {record.location.city}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="px-5 py-5 text-sm font-medium">
                      Experience
                    </td>

                    {records.map((record) => (
                      <td
                        key={record.id}
                        className="px-5 py-5 text-right text-sm text-muted-strong"
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

            <div className="mt-5">
              <Link
                href="/"
                className="text-sm font-medium text-accent hover:text-accent-hover"
              >
                ← Back to Explorer
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}