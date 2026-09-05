"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/theme-toggle";

type Company = {
  id: number;
  name: string;
  normalizedName?: string;
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
              className="text-sm font-medium text-accent"
            >
              Companies
            </Link>

            <Link
              href="/compare"
              className="text-sm font-medium text-muted transition-colors hover:text-accent"
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
            Company Intelligence
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-6xl">
            Explore compensation
            <br />
            <span className="text-accent">company by company.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Compare compensation patterns across companies, engineering levels,
            roles and locations.
          </p>
        </div>

        {/* Search */}
        <div className="mb-10 max-w-2xl">
          <label
            htmlFor="company-search"
            className="mb-2 block text-sm font-medium text-muted"
          >
            SEARCH COMPANIES
          </label>

          <input
            id="company-search"
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search company..."
            className="
              w-full
              rounded-xl
              border
              border-border
              bg-surface
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
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-border bg-surface p-10 text-center">
            <p className="text-muted">Loading companies...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredCompanies.length === 0 && (
          <div className="rounded-2xl border border-border bg-surface p-12 text-center">
            <div className="mb-3 text-3xl">⌕</div>

            <h2 className="text-xl font-semibold">
              No companies found
            </h2>

            <p className="mt-2 text-muted">
              Try searching for a different company.
            </p>
          </div>
        )}

        {/* Company grid */}
        {!loading && !error && filteredCompanies.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Companies
                </h2>

                <p className="mt-1 text-sm text-muted">
                  {filteredCompanies.length}{" "}
                  {filteredCompanies.length === 1
                    ? "company"
                    : "companies"}
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCompanies.map((company) => {
                const compensationCount =
                  company.compensationCount ??
                  company._count?.compensations ??
                  0;

                return (
                  <Link
                    key={company.id}
                    href={`/companies/${company.id}`}
                    className="
                      group
                      rounded-2xl
                      border
                      border-border
                      bg-surface
                      p-6
                      transition-all
                      duration-200
                      hover:-translate-y-0.5
                      hover:border-accent/40
                      hover:shadow-sm
                    "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-accent-soft
                          text-lg
                          font-bold
                          text-accent
                        "
                      >
                        {company.name.charAt(0).toUpperCase()}
                      </div>

                      <span
                        className="
                          text-xl
                          text-muted
                          transition-transform
                          duration-200
                          group-hover:translate-x-1
                          group-hover:text-accent
                        "
                      >
                        →
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-semibold">
                      {company.name}
                    </h3>

                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-sm text-muted">
                        Compensation records
                      </span>

                      <span className="text-sm font-semibold text-foreground">
                        {compensationCount}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </main>
  );
}