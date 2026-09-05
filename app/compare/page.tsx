"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CompensationRecord = {
  id: string;
  baseSalary: string | number;
  stock: string | number;
  bonus: string | number;
  totalCompensation: string | number;
  currency: string;
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
  company: {
    name: string;
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

export default function ComparePage() {
  const [records, setRecords] = useState<CompensationRecord[]>([]);
  const [ids, setIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function compareRecords() {
    const selectedIds = ids
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (selectedIds.length < 2) {
      setError("Select at least 2 compensation records.");
      return;
    }

    if (selectedIds.length > 3) {
      setError("You can compare a maximum of 3 records.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/compare?ids=${selectedIds.join(",")}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to compare compensation records.");
      }

      const result = await response.json();

      const data = result.data ?? result;

      setRecords(
        data.records ??
          data.compensations ??
          data ??
          [],
      );
    } catch (err) {
      console.error(err);

      setRecords([]);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to compare records.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryIds = params.get("ids");

    if (queryIds) {
      setIds(queryIds);
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#08090b] text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="/" className="group">
            <h1 className="text-xl font-semibold tracking-tight">
              Comp<span className="text-violet-400">Scope</span>
            </h1>

            <p className="text-xs text-zinc-500">
              Compensation Intelligence
            </p>
          </a>

          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <a href="/" className="hover:text-white">
              Explorer
            </a>

            <a
              href="/companies"
              className="hover:text-white"
            >
              Companies
            </a>

            <a
              href="/compare"
              className="text-white"
            >
              Compare
            </a>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="inline-flex rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs text-violet-300">
          Compensation Comparison
        </div>

        <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
          Compare compensation
          <span className="text-violet-400"> side by side.</span>
        </h2>

        <p className="mt-5 max-w-2xl text-zinc-400">
          Compare base salary, stock, bonus and total
          compensation across up to three compensation records.
        </p>
      </section>

      {/* Input */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <label className="text-xs uppercase tracking-wide text-zinc-500">
            Compensation record IDs
          </label>

          <div className="mt-3 flex flex-col gap-3 md:flex-row">
            <input
              value={ids}
              onChange={(event) => setIds(event.target.value)}
              placeholder="Paste 2–3 record IDs separated by commas"
              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-violet-400/50"
            />

            <button
              onClick={compareRecords}
              disabled={loading}
              className="rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Comparing..." : "Compare"}
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-600">
            Example: record-id-1, record-id-2
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <section className="mx-auto max-w-7xl px-6 pt-5">
          <div className="rounded-xl border border-red-400/10 bg-red-400/5 p-4 text-sm text-red-400">
            {error}
          </div>
        </section>
      )}

      {/* Comparison */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        {records.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center">
            <h3 className="font-semibold">
              No comparison selected
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Select compensation records to see a side-by-side
              breakdown.
            </p>

            <Link
              href="/"
              className="mt-5 inline-block text-sm text-violet-400 hover:text-violet-300"
            >
              ← Browse compensation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[750px] border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="p-5 text-left text-xs uppercase tracking-wide text-zinc-500">
                    Metric
                  </th>

                  {records.map((record) => (
                    <th
                      key={record.id}
                      className="p-5 text-left"
                    >
                      <p className="font-semibold">
                        {record.company.name}
                      </p>

                      <p className="mt-1 text-xs font-normal text-zinc-500">
                        {record.role.name} ·{" "}
                        {record.level.canonicalLevel}
                      </p>

                      <p className="mt-1 text-xs font-normal text-zinc-600">
                        {record.location.city},{" "}
                        {record.location.country}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-5 text-sm text-zinc-400">
                    Base salary
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 font-medium"
                    >
                      {money(record.baseSalary)}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-white/5">
                  <td className="p-5 text-sm text-zinc-400">
                    Stock
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 font-medium"
                    >
                      {money(record.stock)}
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-white/5">
                  <td className="p-5 text-sm text-zinc-400">
                    Bonus
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 font-medium"
                    >
                      {money(record.bonus)}
                    </td>
                  ))}
                </tr>

                <tr className="bg-violet-400/5">
                  <td className="p-5 text-sm font-semibold text-zinc-300">
                    Total compensation
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 text-lg font-bold text-violet-300"
                    >
                      {money(record.totalCompensation)}
                    </td>
                  ))}
                </tr>

                <tr className="border-t border-white/5">
                  <td className="p-5 text-sm text-zinc-400">
                    Level
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 text-sm"
                    >
                      {record.level.name}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-5 text-sm text-zinc-400">
                    Location
                  </td>

                  {records.map((record) => (
                    <td
                      key={record.id}
                      className="p-5 text-sm"
                    >
                      {record.location.city},{" "}
                      {record.location.country}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <footer className="mx-auto max-w-7xl border-t border-white/10 px-6 py-8 text-xs text-zinc-600">
        CompScope · Compensation intelligence demo
      </footer>
    </main>
  );
}