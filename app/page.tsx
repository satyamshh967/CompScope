"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./components/theme-toggle";

type Compensation = {
  id: number;
  baseSalary: number | string;
  stock: number | string;
  bonus: number | string;
  totalCompensation: number | string;
  currency: string;
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

type ApiResponse = {
  data: Compensation[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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

export default function ExplorerPage() {
  const [records, setRecords] = useState<Compensation[]>([]);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function toggleSelection(id: number) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, id];
    });
  }

  useEffect(() => {
    setPage(1);
  }, [search, level, location]);

  useEffect(() => {
    async function fetchCompensation() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        if (search.trim()) {
          params.set("company", search.trim());
        }

        if (level) {
          params.set("level", level);
        }

        if (location) {
          params.set("location", location);
        }

        params.set("page", String(page));
        params.set("limit", "20");
        params.set("sort", "totalCompensation");
        params.set("order", "desc");

        const response = await fetch(
          `/api/compensation?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to load compensation data");
        }

        const result: ApiResponse = await response.json();

        setRecords(result.data ?? []);

        setPagination(
          result.pagination ?? {
            page,
            limit: 20,
            total: result.data?.length ?? 0,
            totalPages: 1,
          }
        );
      } catch (err) {
        console.error(err);
        setError("Unable to load compensation data.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompensation();
  }, [search, level, location, page]);

  const canCompare = selectedIds.length >= 2;

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
                className="border-b-2 border-accent py-[25px] text-sm font-medium text-foreground"
              >
                Explorer
              </Link>

              <Link
                href="/companies"
                className="py-[25px] text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Companies
              </Link>

              <Link
                href="/compare"
                className="py-[25px] text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                Compare
              </Link>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="mx-auto max-w-[1400px] px-6 py-10 lg:px-10">
        {/* Page heading */}
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                Compensation Intelligence
              </p>

              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Compensation Explorer
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Compare compensation across companies, engineering levels and
                locations.
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-2xl font-semibold tracking-tight">
                {pagination.total.toLocaleString()}
              </p>

              <p className="text-xs uppercase tracking-wide text-muted">
                compensation records
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mb-8 border-y border-border py-6">
          <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
            <div>
              <label
                htmlFor="company-search"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                Company
              </label>

              <input
                id="company-search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search company..."
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-4
                  text-sm
                  text-foreground
                  placeholder:text-muted
                  transition-colors
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent-soft
                "
              />
            </div>

            <div>
              <label
                htmlFor="level-filter"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                Level
              </label>

              <select
                id="level-filter"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-4
                  text-sm
                  text-foreground
                  transition-colors
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent-soft
                "
              >
                <option value="">All levels</option>
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
                <option value="L6">L6</option>
                <option value="L7">L7</option>
                <option value="L8">L8</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="location-filter"
                className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted"
              >
                Location
              </label>

              <select
                id="location-filter"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-4
                  text-sm
                  text-foreground
                  transition-colors
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent-soft
                "
              >
                <option value="">All locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Noida">Noida</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Chennai">Chennai</option>
              </select>
            </div>
          </div>
        </section>

        {/* Selection toolbar */}
        {selectedIds.length > 0 && (
          <div className="mb-5 flex flex-col justify-between gap-3 border border-accent/20 bg-accent-soft px-4 py-3 sm:flex-row sm:items-center">
            <div className="text-sm">
              <span className="font-semibold text-accent">
                {selectedIds.length}
              </span>{" "}
              record{selectedIds.length === 1 ? "" : "s"} selected
              <span className="ml-2 text-xs text-muted">
                Select up to 3
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-sm font-medium text-muted hover:text-foreground"
              >
                Clear
              </button>

              {canCompare && (
                <Link
                  href={`/compare?ids=${selectedIds.join(",")}`}
                  className="
                    rounded-md
                    bg-accent
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    transition-colors
                    hover:bg-accent-hover
                  "
                >
                  Compare selected
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Data section */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Compensation Data
              </h2>

              <p className="mt-1 text-xs text-muted">
                Sorted by total compensation
              </p>
            </div>

            <div className="hidden text-xs text-muted sm:block">
              Page {pagination.page} of {pagination.totalPages}
            </div>
          </div>

          {loading && (
            <div className="border border-border bg-surface px-6 py-12 text-center">
              <p className="text-sm text-muted">
                Loading compensation data...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="border border-danger/30 bg-surface px-6 py-10 text-center">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="border border-border bg-surface px-6 py-12 text-center">
              <h3 className="font-semibold">No matching records</h3>

              <p className="mt-2 text-sm text-muted">
                Try changing your filters.
              </p>
            </div>
          )}

          {!loading && !error && records.length > 0 && (
            <div className="overflow-x-auto border border-border bg-surface">
              <table className="w-full min-w-[900px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="w-14 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Select
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Company
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Role
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Level
                    </th>

                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Location
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Base
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Stock
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Bonus
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Total Comp
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((record) => {
                    const selected = selectedIds.includes(record.id);

                    return (
                      <tr
                        key={record.id}
                        className={`
                          border-b
                          border-border
                          transition-colors
                          hover:bg-surface-muted
                          ${
                            selected
                              ? "bg-accent-soft/50"
                              : ""
                          }
                        `}
                      >
                        <td className="px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={
                              !selected && selectedIds.length >= 3
                            }
                            onChange={() =>
                              toggleSelection(record.id)
                            }
                            className="
                              h-4
                              w-4
                              cursor-pointer
                              accent-[var(--accent)]
                            "
                            aria-label={`Select ${record.company.name} ${record.role.name}`}
                          />
                        </td>

                        <td className="px-4 py-4">
                          <span className="text-sm font-semibold">
                            {record.company.name}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-muted-strong">
                          {record.role.name}
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                            {record.level.name}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-muted-strong">
                          {record.location.city}
                        </td>

                        <td className="px-4 py-4 text-right text-sm tabular-nums">
                          {formatSalary(
                            record.baseSalary,
                            record.currency
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm tabular-nums text-muted-strong">
                          {formatSalary(
                            record.stock,
                            record.currency
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm tabular-nums text-muted-strong">
                          {formatSalary(
                            record.bonus,
                            record.currency
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-bold tabular-nums">
                          {formatSalary(
                            record.totalCompensation,
                            record.currency
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading &&
            !error &&
            pagination.totalPages > 1 && (
              <div className="mt-5 flex items-center justify-between border-t border-border pt-5">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  className="
                    rounded-md
                    border
                    border-border
                    bg-surface
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-colors
                    hover:border-accent
                    hover:text-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  ← Previous
                </button>

                <span className="text-sm text-muted">
                  {page} / {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        pagination.totalPages,
                        current + 1
                      )
                    )
                  }
                  className="
                    rounded-md
                    border
                    border-border
                    bg-surface
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-colors
                    hover:border-accent
                    hover:text-accent
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next →
                </button>
              </div>
            )}
        </section>
      </div>
    </main>
  );
}