"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/app/components/theme-toggle";

type CompanyRanking = {
  rank: number;
  id: string;
  name: string;
  records: number;
  averageTotal: number;
  highestLevel: string;
};

function formatSalary(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<CompanyRanking[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompanies() {
      try {
        const response = await fetch("/api/companies/rankings", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load company rankings");
        }

        const result = await response.json();

        setCompanies(result.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Unable to load company rankings.");
      } finally {
        setLoading(false);
      }
    }

    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) =>
      company.name.toLowerCase().includes(query),
    );
  }, [companies, search]);

  return (
    <main className="min-h-screen bg-background text-foreground">
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

            <span className="text-xs font-medium text-foreground sm:text-sm">
              Companies
            </span>

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

      <section className="mx-auto max-w-7xl px-5 pb-8 pt-10 sm:pt-12">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">
          Company intelligence
        </p>

        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Compensation rankings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Compare companies using average total compensation
          across the synthetic demo dataset.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-5">
        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3 text-xs leading-5 text-muted">
          <span className="font-medium text-foreground">
            Demo dataset:
          </span>{" "}
          These compensation records are synthetic and are
          provided only to demonstrate the application's
          analytics capabilities.
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-12">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {loading ? (
            <div className="px-5 py-14 text-center text-sm text-muted">
              Loading company rankings...
            </div>
          ) : error ? (
            <div className="px-5 py-14 text-center text-sm text-danger">
              {error}
            </div>
          ) : companies.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-muted">
              No company data available.
            </div>
          ) : (
            <>
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">
                      Company ranking
                    </h2>

                    <p className="mt-1 text-xs text-muted">
                      Ranked by average total compensation.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search companies..."
                      aria-label="Search companies"
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={() => setSearch("")}
                        aria-label="Clear company search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition hover:bg-surface-muted hover:text-foreground"
                      >
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-4 w-4"
                        >
                          <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {search && (
                  <div className="mt-3 text-xs text-muted">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {filteredCompanies.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {companies.length}
                    </span>{" "}
                    companies
                  </div>
                )}
              </div>

              {filteredCompanies.length === 0 ? (
                <div className="px-5 py-14 text-center">
                  <p className="text-sm font-medium">
                    No companies found
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    Try searching for a different company name.
                  </p>

                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mt-4 text-xs font-medium text-accent hover:text-accent-hover"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="border-b border-border bg-surface-muted">
                        <tr className="text-xs uppercase tracking-wide text-muted">
                          <th className="px-5 py-3.5 font-medium">
                            Rank
                          </th>

                          <th className="px-5 py-3.5 font-medium">
                            Company
                          </th>

                          <th className="px-5 py-3.5 font-medium">
                            Records
                          </th>

                          <th className="px-5 py-3.5 font-medium">
                            Avg. total
                          </th>

                          <th className="px-5 py-3.5 font-medium">
                            Highest level
                          </th>

                          <th className="px-5 py-3.5 font-medium">
                            View
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border">
                        {filteredCompanies.map(
                          (company, index) => (
                            <tr
                              key={company.id}
                              className="transition-colors hover:bg-surface-muted"
                            >
                              <td className="px-5 py-4">
                                <span
                                  className={
                                    index === 0
                                      ? "font-semibold text-accent"
                                      : "text-muted"
                                  }
                                >
                                  #{index + 1}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <Link
                                  href={`/companies/${company.id}`}
                                  className="font-semibold hover:text-accent"
                                >
                                  {company.name}
                                </Link>
                              </td>

                              <td className="px-5 py-4 text-muted">
                                {company.records}
                              </td>

                              <td className="px-5 py-4 font-semibold">
                                {formatSalary(
                                  company.averageTotal,
                                )}
                              </td>

                              <td className="px-5 py-4">
                                <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                                  {company.highestLevel}
                                </span>
                              </td>

                              <td className="px-5 py-4">
                                <Link
                                  href={`/companies/${company.id}`}
                                  className="text-xs font-medium text-accent hover:text-accent-hover"
                                >
                                  Intelligence →
                                </Link>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t border-border px-5 py-4 text-xs text-muted">
                    {search
                      ? `${filteredCompanies.length} of ${companies.length} companies shown`
                      : `${companies.length} companies ranked`}{" "}
                    · average total compensation shown in INR
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      <footer className="border-t border-border px-5 py-8 text-center text-xs text-muted">
        CompScope · Synthetic demo dataset · Compensation
        intelligence
      </footer>
    </main>
  );
}