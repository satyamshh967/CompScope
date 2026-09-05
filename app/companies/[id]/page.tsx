"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type RecordItem = {
  id: string;
  baseSalary: string | number;
  stock: string | number;
  bonus: string | number;
  totalCompensation: string | number;
  role: {
    name: string;
  };
  level: {
    name: string;
    canonicalLevel: string;
    seniority: number | null;
  };
  location: {
    city: string;
    country: string;
  };
};

type CompanyResponse = {
  data: {
    company: {
      id: string;
      name: string;
    };
    stats: {
      _count: {
        _all: number;
      };
      _avg: {
        baseSalary: string | number | null;
        stock: string | number | null;
        bonus: string | number | null;
        totalCompensation: string | number | null;
      };
      _min: {
        totalCompensation: string | number | null;
      };
      _max: {
        totalCompensation: string | number | null;
      };
    };
    records: RecordItem[];
  };
};

function money(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "—";

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [company, setCompany] =
    useState<CompanyResponse["data"] | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompany() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/companies/${id}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Company not found");
          }

          throw new Error("Failed to load company");
        }

        const result: CompanyResponse = await response.json();

        setCompany(result.data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load company",
        );
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [params]);

  const levelStats = useMemo(() => {
    if (!company) return [];

    const grouped = new Map<
      string,
      {
        level: string;
        seniority: number;
        total: number;
        count: number;
      }
    >();

    for (const record of company.records) {
      const levelName = record.level.canonicalLevel;

      const existing = grouped.get(levelName);

      if (existing) {
        existing.total += Number(record.totalCompensation);
        existing.count += 1;
      } else {
        grouped.set(levelName, {
          level: levelName,
          seniority: record.level.seniority ?? 999,
          total: Number(record.totalCompensation),
          count: 1,
        });
      }
    }

    return Array.from(grouped.values())
      .map((item) => ({
        ...item,
        average: item.total / item.count,
      }))
      .sort((a, b) => a.seniority - b.seniority);
  }, [company]);

  const maxLevelSalary = Math.max(
    ...levelStats.map((item) => item.average),
    1,
  );

  const roles = company
    ? Array.from(
        new Set(company.records.map((record) => record.role.name)),
      )
    : [];

  const locations = company
    ? Array.from(
        new Set(
          company.records.map(
            (record) => record.location.city,
          ),
        ),
      )
    : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-[#08090b] p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-zinc-500">
            Loading company intelligence...
          </p>
        </div>
      </main>
    );
  }

  if (error || !company) {
    return (
      <main className="min-h-screen bg-[#08090b] p-10 text-white">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/companies"
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            ← Back to companies
          </Link>

          <div className="mt-10 rounded-2xl border border-red-400/10 p-10">
            <h1 className="text-xl font-semibold">
              Unable to load company
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/">
            <h1 className="text-xl font-semibold tracking-tight">
              Comp<span className="text-violet-400">Scope</span>
            </h1>

            <p className="text-xs text-zinc-500">
              Compensation Intelligence
            </p>
          </Link>

          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="/" className="hover:text-white">
              Explorer
            </a>

            <a
              href="/companies"
              className="text-white"
            >
              Companies
            </a>

            <a href="/compare" className="hover:text-white">
              Compare
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12">
        <Link
          href="/companies"
          className="text-sm text-zinc-500 transition hover:text-violet-300"
        >
          ← Back to companies
        </Link>

        <div className="mt-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
              Company Intelligence
            </div>

            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {company.company.name}
            </h2>

            <p className="mt-3 text-zinc-400">
              Compensation analysis across levels, roles and
              locations.
            </p>
          </div>

          <div className="text-sm text-zinc-500">
            {company.stats._count._all} compensation records
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase text-zinc-500">
              Average Total
            </p>

            <p className="mt-2 text-2xl font-semibold text-violet-300">
              {money(
                company.stats._avg.totalCompensation,
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase text-zinc-500">
              Average Base
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {money(company.stats._avg.baseSalary)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase text-zinc-500">
              Average Stock
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {money(company.stats._avg.stock)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs uppercase text-zinc-500">
              Average Bonus
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {money(company.stats._avg.bonus)}
            </p>
          </div>
        </div>
      </section>

      {/* Level Analysis */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-wide text-violet-300">
              Level-based analysis
            </p>

            <h3 className="mt-2 text-2xl font-semibold">
              Compensation by level
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Average total compensation grouped by career
              level.
            </p>
          </div>

          <div className="space-y-5">
            {levelStats.map((item) => (
              <div key={item.level}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-10 font-semibold text-zinc-200">
                      {item.level}
                    </span>

                    <span className="text-xs text-zinc-600">
                      {item.count} records
                    </span>
                  </div>

                  <span className="font-medium text-violet-300">
                    {money(item.average)}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-violet-500 transition-all"
                    style={{
                      width: `${Math.max(
                        4,
                        (item.average / maxLevelSalary) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles + Locations */}
      <section className="mx-auto grid max-w-7xl gap-4 px-6 pb-10 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-xs uppercase text-zinc-500">
            Roles
          </p>

          <h3 className="mt-2 text-xl font-semibold">
            Reported roles
          </h3>

          <div className="mt-5 flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <p className="text-xs uppercase text-zinc-500">
            Locations
          </p>

          <h3 className="mt-2 text-xl font-semibold">
            Reported locations
          </h3>

          <div className="mt-5 flex flex-wrap gap-2">
            {locations.map((location) => (
              <span
                key={location}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Range */}
      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase text-zinc-500">
                Compensation range
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                Reported total compensation
              </h3>
            </div>

            <div className="flex gap-8">
              <div>
                <p className="text-xs text-zinc-600">
                  Lowest
                </p>

                <p className="mt-1 font-medium text-zinc-300">
                  {money(
                    company.stats._min.totalCompensation,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-600">
                  Highest
                </p>

                <p className="mt-1 font-medium text-violet-300">
                  {money(
                    company.stats._max.totalCompensation,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-xs text-zinc-600">
        CompScope · Compensation intelligence demo
      </footer>
    </main>
  );
}