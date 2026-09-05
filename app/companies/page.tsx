"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/theme-toggle";

type Company = {
  id: number;
  name: string;
  compensationCount?: number;
  _count?: {
    compensations?: number;
  };
};

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCompanies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/companies");

        if (!response.ok) {
          throw new Error("Failed to load companies");
        }

        const result = await response.json();

        const data = result.data ?? result.companies ?? result;

        setCompanies(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError("Unable to load companies.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

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
                className="border-b-2 border-accent py-[25px] text-sm font-medium text-foreground"
              >
                Companies
              </Link>

              <Link
                href="/compare"
                className="py-[25px] text-sm font-medium text-muted hover:text-foreground"
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
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
            Company Intelligence
          </p>

          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Companies
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Explore compensation patterns across companies, levels and
            locations.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-xl">
          <label
            htmlFor="company-search"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted"
          >
            Search companies
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
              focus:border-accent
              focus:ring-2
              focus:ring-accent-soft
            "
          />
        </div>

        {loading && (
          <div className="border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
            Loading companies...
          </div>
        )}

        {!loading && error && (
          <div className="border border-danger/30 bg-surface px-6 py-10 text-center text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="border border-border bg-surface px-6 py-12 text-center">
            <h2 className="font-semibold">No companies found</h2>

            <p className="mt-2 text-sm text-muted">
              Try a different search term.
            </p>
          </div>
        )}

        {!loading && !error && filteredCompanies.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Company Directory
                </h2>

                <p className="mt-1 text-xs text-muted">
                  {filteredCompanies.length} companies
                </p>
              </div>
            </div>

            <div className="overflow-hidden border border-border bg-surface">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-muted">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Company
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Compensation Records
                    </th>

                    <th className="w-20 px-5 py-3" />
                  </tr>
                </thead>

                <tbody>
                  {filteredCompanies.map((company) => {
                    const count =
                      company.compensationCount ??
                      company._count?.compensations ??
                      0;

                    return (
                      <tr
                        key={company.id}
                        className="border-b border-border transition-colors hover:bg-surface-muted"
                      >
                        <td className="px-5 py-5">
                          <Link
                            href={`/companies/${company.id}`}
                            className="group flex items-center gap-4"
                          >
                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent-soft text-sm font-bold text-accent">
                              {company.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="text-sm font-semibold group-hover:text-accent">
                              {company.name}
                            </span>
                          </Link>
                        </td>

                        <td className="px-5 py-5 text-right text-sm tabular-nums text-muted-strong">
                          {count}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <Link
                            href={`/companies/${company.id}`}
                            className="text-sm font-medium text-accent hover:text-accent-hover"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}