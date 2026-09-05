"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Company = {
  id: string;
  name: string;
  recordCount: number;
  averageBaseSalary: string | number | null;
  averageBonus: string | number | null;
  averageStock: string | number | null;
  averageTotalCompensation: string | number | null;
  highestTotalCompensation: string | number | null;
};

function formatSalary(value: string | number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

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

        const response = await fetch("/api/companies", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch companies");
        }

        const result = await response.json();

        setCompanies(result.data);
      } catch (err) {
        console.error("Companies fetch failed:", err);
        setError("Unable to load company intelligence.");
      } finally {
        setLoading(false);
      }
    }

    fetchCompanies();
  }, []);

  const filteredCompanies = companies.filter((company) =>
    company.name
      .toLowerCase()
      .includes(search.toLowerCase().trim()),
  );

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* ==================== NAVIGATION ==================== */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="group">
            <h1 className="text-xl font-semibold tracking-tight">
              Comp<span className="text-violet-400">Scope</span>
            </h1>

            <p className="text-xs text-zinc-500">
              Compensation Intelligence
            </p>
          </Link>

          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link
              href="/"
              className="transition hover:text-white"
            >
              Explorer
            </Link>

            <Link
              href="/companies"
              className="text-white"
            >
              Companies
            </Link>

            <Link
              href="/compare"
              className="transition hover:text-white"
            >
              Compare
            </Link>
          </div>
        </div>
      </nav>

      {/* ==================== HERO ==================== */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
            Company Intelligence
          </div>

          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            See how companies
            <span className="text-violet-400">
              {" "}
              actually compensate.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-400">
            Compare average compensation, equity, bonuses and
            reported salary records across companies.
          </p>
        </div>
      </section>

      {/* ==================== SEARCH ==================== */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <label className="mb-2 block text-xs font-medium text-zinc-500">
            SEARCH COMPANIES
          </label>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by company name..."
            className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-violet-400/50"
          />
        </div>
      </section>

      {/* ==================== COMPANY GRID ==================== */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <div className="rounded-2xl border border-white/10 p-12 text-center text-sm text-zinc-500">
            Loading company intelligence...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-400/10 p-12 text-center">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="rounded-2xl border border-white/10 p-12 text-center text-sm text-zinc-500">
            No companies found.
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  Companies
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  {filteredCompanies.length} companies
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredCompanies.map((company) => (
                <Link
                  key={company.id}
                  href={`/companies/${company.id}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:bg-white/[0.04]"
                >
                  {/* Company header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-violet-300">
                        {company.name
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h4 className="font-semibold">
                          {company.name}
                        </h4>

                        <p className="text-xs text-zinc-500">
                          {company.recordCount} compensation records
                        </p>
                      </div>
                    </div>

                    <span className="text-zinc-600 transition group-hover:text-violet-300">
                      →
                    </span>
                  </div>

                  {/* Main metric */}
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">
                      Average total compensation
                    </p>

                    <p className="mt-1 text-2xl font-semibold tracking-tight text-violet-300">
                      {formatSalary(
                        company.averageTotalCompensation,
                      )}
                    </p>
                  </div>

                  {/* Breakdown */}
                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[10px] uppercase text-zinc-600">
                        Base
                      </p>

                      <p className="mt-1 text-xs text-zinc-300">
                        {formatSalary(
                          company.averageBaseSalary,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[10px] uppercase text-zinc-600">
                        Stock
                      </p>

                      <p className="mt-1 text-xs text-zinc-300">
                        {formatSalary(
                          company.averageStock,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
                      <p className="text-[10px] uppercase text-zinc-600">
                        Bonus
                      </p>

                      <p className="mt-1 text-xs text-zinc-300">
                        {formatSalary(
                          company.averageBonus,
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Highest compensation */}
                  <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                    <span className="text-xs text-zinc-500">
                      Highest reported total
                    </span>

                    <span className="text-xs font-medium text-zinc-300">
                      {formatSalary(
                        company.highestTotalCompensation,
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-xs text-zinc-600">
        CompScope · Compensation intelligence demo
      </footer>
    </main>
  );
}