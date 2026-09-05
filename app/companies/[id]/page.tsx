"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "../../components/theme-toggle";

type Compensation = {
  id: number;
  baseSalary: number | string;
  stock: number | string;
  bonus: number | string;
  totalCompensation: number | string;
  currency: string;
  role: {
    name: string;
  };
  level: {
    name: string;
  };
  location: {
    city: string;
    country: string;
  };
};

type Company = {
  id: number;
  name: string;
  compensations: Compensation[];
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

export default function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCompany() {
      try {
        const { id } = await params;

        const response = await fetch(`/api/companies/${id}`);

        if (!response.ok) {
          throw new Error("Company not found");
        }

        const result = await response.json();

        setCompany(result.data ?? result);
      } catch (err) {
        console.error(err);
        setError("Unable to load company details.");
      } finally {
        setLoading(false);
      }
    }

    loadCompany();
  }, [params]);

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
        <Link
          href="/companies"
          className="text-sm font-medium text-accent hover:text-accent-hover"
        >
          ← Companies
        </Link>

        {loading && (
          <div className="mt-8 border border-border bg-surface px-6 py-12 text-center text-sm text-muted">
            Loading company...
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 border border-danger/30 bg-surface px-6 py-10 text-center text-sm text-danger">
            {error}
          </div>
        )}

        {!loading && !error && company && (
          <>
            <section className="mt-8 border-b border-border pb-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent">
                Company Profile
              </p>

              <h1 className="text-4xl font-bold tracking-tight">
                {company.name}
              </h1>

              <p className="mt-2 text-sm text-muted">
                Compensation intelligence across roles, levels and locations.
              </p>
            </section>

            <section className="grid gap-px border-b border-x border-border bg-border md:grid-cols-3">
              <div className="bg-surface px-6 py-6">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Records
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {company.compensations.length}
                </p>
              </div>

              <div className="bg-surface px-6 py-6">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Highest Total Comp
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {formatSalary(
                    Math.max(
                      ...company.compensations.map((item) =>
                        Number(item.totalCompensation)
                      )
                    )
                  )}
                </p>
              </div>

              <div className="bg-surface px-6 py-6">
                <p className="text-xs uppercase tracking-wide text-muted">
                  Lowest Total Comp
                </p>

                <p className="mt-2 text-2xl font-semibold">
                  {formatSalary(
                    Math.min(
                      ...company.compensations.map((item) =>
                        Number(item.totalCompensation)
                      )
                    )
                  )}
                </p>
              </div>
            </section>

            <section className="mt-10">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Compensation Records
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Compensation data available for this company.
                </p>
              </div>

              <div className="overflow-x-auto border border-border bg-surface">
                <table className="w-full min-w-[850px] border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-muted">
                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Role
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Level
                      </th>

                      <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Location
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Base
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Total Comp
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {company.compensations.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-border hover:bg-surface-muted"
                      >
                        <td className="px-5 py-4 text-sm font-medium">
                          {record.role.name}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-semibold text-accent">
                            {record.level.name}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-strong">
                          {record.location.city},{" "}
                          {record.location.country}
                        </td>

                        <td className="px-5 py-4 text-right text-sm tabular-nums">
                          {formatSalary(
                            record.baseSalary,
                            record.currency
                          )}
                        </td>

                        <td className="px-5 py-4 text-right text-sm font-bold tabular-nums">
                          {formatSalary(
                            record.totalCompensation,
                            record.currency
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}