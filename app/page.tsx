"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./components/theme-toggle";

type Compensation = {
  id: string;
  baseSalary: string | number;
  stock: string | number;
  bonus: string | number;
  totalCompensation: string | number;
  currency: string;
  company: {
    name: string;
  };
  role: {
    name: string;
  };
  level: {
    name: string;
    canonicalLevel: string;
  };
  location: {
    city: string;
    country: string;
  };
};

type ApiResponse = {
  data: Compensation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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

export default function Home() {
  const [data, setData] = useState<Compensation[]>([]);
  const [pagination, setPagination] = useState<
    ApiResponse["pagination"] | null
  >(null);

  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function toggleSelection(id: string) {
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

      params.set("limit", "20");
      params.set("page", page.toString());
      params.set("sort", "totalCompensation");
      params.set("order", "desc");

      const response = await fetch(
        `/api/compensation?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch compensation data");
      }

      const result: ApiResponse = await response.json();

      setData(result.data);
      setPagination(result.pagination);
    } catch (err) {
      console.error("Compensation fetch failed:", err);
      setError("Unable to load compensation data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setPage(1);
  }, [search, level, location]);

  useEffect(() => {
    fetchCompensation();
  }, [search, level, location, page]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <h1 className="text-xl font-semibold tracking-tight">
              Comp<span className="text-violet-500">Scope</span>
            </h1>

            <p className="text-xs text-zinc-500">
              Compensation Intelligence
            </p>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden items-center gap-6 text-sm text-zinc-500 sm:flex">
              <Link
                href="/"
                className="text-violet-500 transition hover:text-violet-600"
              >
                Explorer
              </Link>

              <Link
                href="/companies"
                className="transition hover:text-violet-500"
              >
                Companies
              </Link>

              <Link
                href="/compare"
                className="transition hover:text-violet-500"
              >
                Compare
              </Link>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-600 dark:text-violet-300">
            Levels matter more than job titles
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Understand what your
            <span className="text-violet-500">
              {" "}
              compensation is really worth.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 dark:text-zinc-400">
            Explore compensation across companies, engineering
            levels and locations. Compare base salary, stock,
            bonus and total compensation in one place.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-black/10 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">
                COMPANY
              </label>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company..."
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-violet-500/50 dark:border-white/10 dark:bg-black/30 dark:placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">
                LEVEL
              </label>

              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-violet-500/50 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
              >
                <option value="">All levels</option>
                <option value="Intern">Intern</option>
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="L4">L4</option>
                <option value="L5">L5</option>
                <option value="L6">L6</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-500">
                LOCATION
              </label>

              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-violet-500/50 dark:border-white/10 dark:bg-black/30 dark:text-zinc-300"
              >
                <option value="">All locations</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Gurgaon">Gurgaon</option>
                <option value="Chennai">Chennai</option>
                <option value="Noida">Noida</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">
              Compensation Explorer
            </h3>

            {pagination && (
              <p className="mt-1 text-xs text-zinc-500">
                {pagination.total} compensation records
              </p>
            )}
          </div>

          <div className="text-xs text-zinc-500">
            Sorted by total compensation ↓
          </div>
        </div>

        {/* Compare Selection */}
        {selectedIds.length > 0 && (
          <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">
                {selectedIds.length} record
                {selectedIds.length !== 1 ? "s" : ""} selected
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Select 2–3 records to compare compensation side by side.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className="rounded-xl border border-black/10 px-4 py-2.5 text-xs text-zinc-500 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/[0.05]"
              >
                Clear
              </button>

              <Link
                href={
                  selectedIds.length >= 2
                    ? `/compare?ids=${selectedIds.join(",")}`
                    : "#"
                }
                onClick={(event) => {
                  if (selectedIds.length < 2) {
                    event.preventDefault();
                  }
                }}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                  selectedIds.length >= 2
                    ? "bg-violet-500 text-white hover:bg-violet-600"
                    : "cursor-not-allowed bg-black/5 text-zinc-400 dark:bg-white/5 dark:text-zinc-600"
                }`}
              >
                Compare selected
              </Link>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-black/10 dark:border-white/10">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              Loading compensation data...
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-sm text-red-500">{error}</p>

              <button
                onClick={fetchCompensation}
                className="mt-4 rounded-lg border border-black/10 px-4 py-2 text-xs text-zinc-600 transition hover:bg-black/5 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.05]"
              >
                Try again
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-500">
              No compensation records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="border-b border-black/10 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-white/10 dark:bg-white/[0.03]">
                  <tr>
                    <th className="px-5 py-4">
                      Select
                    </th>
                    <th className="px-5 py-4">
                      Company
                    </th>
                    <th className="px-5 py-4">
                      Role
                    </th>
                    <th className="px-5 py-4">
                      Level
                    </th>
                    <th className="px-5 py-4">
                      Location
                    </th>
                    <th className="px-5 py-4">
                      Base
                    </th>
                    <th className="px-5 py-4">
                      Stock
                    </th>
                    <th className="px-5 py-4">
                      Bonus
                    </th>
                    <th className="px-5 py-4">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                  {data.map((record) => {
                    const isSelected = selectedIds.includes(
                      record.id,
                    );

                    return (
                      <tr
                        key={record.id}
                        className={`transition hover:bg-black/[0.02] dark:hover:bg-white/[0.03] ${
                          isSelected
                            ? "bg-violet-500/[0.05]"
                            : ""
                        }`}
                      >
                        <td className="px-5 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              toggleSelection(record.id)
                            }
                            disabled={
                              !isSelected &&
                              selectedIds.length >= 3
                            }
                            className="h-4 w-4 cursor-pointer accent-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label={`Select ${record.company.name} ${record.role.name} for comparison`}
                          />
                        </td>

                        <td className="px-5 py-4 font-medium">
                          {record.company.name}
                        </td>

                        <td className="px-5 py-4 text-zinc-500">
                          {record.role.name}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-600 dark:text-violet-300">
                            {record.level.canonicalLevel}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-zinc-500">
                          {record.location.city}
                        </td>

                        <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                          {formatSalary(record.baseSalary)}
                        </td>

                        <td className="px-5 py-4 text-zinc-500">
                          {formatSalary(record.stock)}
                        </td>

                        <td className="px-5 py-4 text-zinc-500">
                          {formatSalary(record.bonus)}
                        </td>

                        <td className="px-5 py-4 font-semibold text-violet-600 dark:text-violet-300">
                          {formatSalary(record.totalCompensation)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between">
            <p className="text-xs text-zinc-500">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
                disabled={page === 1 || loading}
                className="rounded-lg border border-black/10 px-4 py-2 text-xs text-zinc-500 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:hover:bg-white/[0.05]"
              >
                ← Previous
              </button>

              <button
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      pagination.totalPages,
                      current + 1,
                    ),
                  )
                }
                disabled={
                  page === pagination.totalPages ||
                  loading
                }
                className="rounded-lg border border-black/10 px-4 py-2 text-xs text-zinc-500 transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30 dark:border-white/10 dark:hover:bg-white/[0.05]"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>

      <footer className="mx-auto max-w-7xl border-t border-black/10 px-6 py-8 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-600">
        CompScope · Compensation intelligence demo
      </footer>
    </main>
  );
}