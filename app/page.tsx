"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ThemeToggle from "@/app/components/theme-toggle";

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

type SortOption =
  | "totalCompensation"
  | "baseSalary"
  | "stock"
  | "bonus";

type SuggestionType = "company" | "role";

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

function formatCompact(value: number) {
  if (value >= 10_000_000) {
    return `₹${(value / 10_000_000).toFixed(1)}Cr`;
  }

  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(1)}L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function sortLabel(sort: SortOption) {
  const labels: Record<SortOption, string> = {
    totalCompensation: "Total compensation",
    baseSalary: "Base salary",
    stock: "Stock",
    bonus: "Bonus",
  };

  return labels[sort];
}

function SearchSuggestions({
  value,
  suggestions,
  type,
  onSelect,
}: {
  value: string;
  suggestions: string[];
  type: SuggestionType;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();

    if (!query) {
      return [];
    }

    return suggestions
      .filter((item) =>
        item.toLowerCase().includes(query),
      )
      .filter(
        (item, index, array) =>
          array.indexOf(item) === index,
      )
      .slice(0, 5);
  }, [value, suggestions]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClick,
      );
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-w-0"
    >
      <input
        type="text"
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setOpen(true);

          if (type === "company") {
            // handled by parent through the wrapper below
          }
        }}
        className="hidden"
        aria-hidden="true"
      />

      {open && filteredSuggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-lg border border-border bg-surface shadow-xl">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                onSelect(suggestion);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors hover:bg-surface-muted"
            >
              <span className="truncate font-medium text-foreground">
                {suggestion}
              </span>

              <span className="ml-3 shrink-0 text-[10px] text-muted">
                {type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2.5 shadow-xl">
      <p className="text-xs font-semibold text-foreground">
        {label}
      </p>

      <p className="mt-1 text-xs text-accent">
        {formatSalary(Number(payload[0]?.value))}
      </p>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<Compensation[]>([]);

  const [pagination, setPagination] =
    useState<ApiResponse["pagination"] | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState("");

  const [sort, setSort] =
    useState<SortOption>("totalCompensation");

  const [order, setOrder] =
    useState<"asc" | "desc">("desc");

  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );

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

  function clearFilters() {
    setSearch("");
    setRole("");
    setLevel("");
    setLocation("");
    setSort("totalCompensation");
    setOrder("desc");
    setPage(1);
  }

  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(role.trim()) ||
    Boolean(level) ||
    Boolean(location);

  async function fetchCompensation() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("company", search.trim());
      }

      if (role.trim()) {
        params.set("role", role.trim());
      }

      if (level) {
        params.set("level", level);
      }

      if (location) {
        params.set("location", location);
      }

      params.set("limit", "20");
      params.set("page", page.toString());
      params.set("sort", sort);
      params.set("order", order);

      const response = await fetch(
        `/api/compensation?${params.toString()}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch compensation data",
        );
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
  }, [
    search,
    role,
    level,
    location,
    sort,
    order,
  ]);

  useEffect(() => {
    fetchCompensation();
  }, [
    search,
    role,
    level,
    location,
    sort,
    order,
    page,
  ]);

  /*
   * Search suggestions are derived from the currently
   * available dataset. These common values ensure the
   * search UI remains useful even before results load.
   */
  const companySuggestions = useMemo(() => {
    const defaults = [
      "Google",
      "Microsoft",
      "Apple",
      "Amazon",
      "Meta",
      "Netflix",
    ];

    const fromData = data.map(
      (record) => record.company.name,
    );

    return [...defaults, ...fromData].filter(
      (item, index, array) =>
        array.indexOf(item) === index,
    );
  }, [data]);

  const roleSuggestions = useMemo(() => {
    const defaults = [
      "Software Engineer",
      "Full Stack Engineer",
      "Frontend Engineer",
      "Backend Engineer",
      "Product Manager",
      "Data Scientist",
    ];

    const fromData = data.map(
      (record) => record.role.name,
    );

    return [...defaults, ...fromData].filter(
      (item, index, array) =>
        array.indexOf(item) === index,
    );
  }, [data]);

  /*
   * Dashboard metrics for the currently visible result
   * set. These are intentionally derived from the API
   * response rather than hard-coded.
   */
  const dashboard = useMemo(() => {
    if (!data.length) {
      return {
        averageTotal: 0,
        highestTotal: 0,
        averageBase: 0,
        companies: 0,
      };
    }

    const totals = data.map((record) =>
      Number(record.totalCompensation),
    );

    const bases = data.map((record) =>
      Number(record.baseSalary),
    );

    return {
      averageTotal:
        totals.reduce((sum, value) => sum + value, 0) /
        totals.length,

      highestTotal: Math.max(...totals),

      averageBase:
        bases.reduce((sum, value) => sum + value, 0) /
        bases.length,

      companies: new Set(
        data.map((record) => record.company.name),
      ).size,
    };
  }, [data]);

  const chartData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          Number(b.totalCompensation) -
          Number(a.totalCompensation),
      )
      .slice(0, 5)
      .map((record) => ({
        company:
          record.company.name.length > 15
            ? `${record.company.name.slice(0, 15)}…`
            : record.company.name,
        total: Number(record.totalCompensation),
      }));
  }, [data]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      {/* NAVIGATION */}
      <nav className="border-b border-border bg-surface">
        <div className="mx-auto flex h-[72px] max-w-7xl min-w-0 items-center justify-between gap-4 px-4 sm:px-5">
          <Link
            href="/"
            className="min-w-0 shrink-0"
          >
            <div className="text-base font-semibold tracking-tight">
              Comp<span className="text-accent">Scope</span>
            </div>

            <div className="hidden text-[11px] text-muted sm:block">
              Compensation intelligence
            </div>
          </Link>

          <div className="flex min-w-0 items-center gap-2 sm:gap-5">
            <span className="text-xs font-medium text-foreground sm:text-sm">
              Explorer
            </span>

            <Link
              href="/companies"
              className="text-xs text-muted transition hover:text-foreground sm:text-sm"
            >
              Companies
            </Link>

            <Link
              href="/compare"
              className="text-xs text-muted transition hover:text-foreground sm:text-sm"
            >
              Compare
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="animate-fade-up mx-auto max-w-7xl px-4 pb-7 pt-9 sm:px-5 sm:pt-11">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex rounded-md border border-accent/20 bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
            Levels matter more than job titles
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            Understand what compensation is really worth.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-[15px]">
            Explore compensation across companies, levels
            and locations. Compare base salary, equity,
            bonus and total compensation in one place.
          </p>
        </div>
      </section>

      {/* TRANSPARENCY */}
      <section className="animate-fade-up mx-auto max-w-7xl px-4 pb-5 sm:px-5">
        <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface-muted px-3.5 py-2.5 text-xs leading-5 text-muted">
          <span className="mt-0.5 shrink-0 text-accent">
            ●
          </span>

          <p className="min-w-0">
            <span className="font-medium text-foreground">
              Synthetic demo data.
            </span>{" "}
            Compensation records are generated for
            demonstration purposes and are not verified
            market compensation.
          </p>
        </div>
      </section>

      {/* DASHBOARD OVERVIEW */}
      <section className="mx-auto max-w-7xl px-4 pb-5 sm:px-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-fade-up rounded-xl border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Avg. total compensation
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {loading
                ? "—"
                : formatCompact(dashboard.averageTotal)}
            </p>

            <p className="mt-1 text-xs text-muted">
              Current result set
            </p>
          </div>

          <div className="animate-fade-up rounded-xl border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Highest total
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight text-accent">
              {loading
                ? "—"
                : formatCompact(dashboard.highestTotal)}
            </p>

            <p className="mt-1 text-xs text-muted">
              Highest visible record
            </p>
          </div>

          <div className="animate-fade-up rounded-xl border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Avg. base salary
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {loading
                ? "—"
                : formatCompact(dashboard.averageBase)}
            </p>

            <p className="mt-1 text-xs text-muted">
              Excludes equity and bonus
            </p>
          </div>

          <div className="animate-fade-up rounded-xl border border-border bg-surface p-4 transition duration-200 hover:-translate-y-0.5 hover:border-border-strong">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted">
              Companies represented
            </p>

            <p className="mt-2 text-xl font-semibold tracking-tight">
              {loading ? "—" : dashboard.companies}
            </p>

            <p className="mt-1 text-xs text-muted">
              In current result set
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-5">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                Explore compensation
              </h2>

              <p className="mt-1 text-xs text-muted">
                Filter records to find comparable compensation.
              </p>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start text-xs font-medium text-accent transition hover:text-accent-hover sm:self-auto"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* COMPANY */}
            <div className="relative min-w-0">
              <label
                htmlFor="company"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                Company
              </label>

              <input
                id="company"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="e.g. Google"
                autoComplete="off"
                list="company-suggestions"
                className="
                  h-10
                  w-full
                  min-w-0
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  text-foreground
                  placeholder:text-muted
                  transition
                  duration-150
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent/10
                "
              />

              <datalist id="company-suggestions">
                {companySuggestions.map((company) => (
                  <option
                    key={company}
                    value={company}
                  />
                ))}
              </datalist>

              {search.trim() && (
                <div className="mt-1 text-[10px] text-muted">
                  Try:{" "}
                  {companySuggestions
                    .filter((company) =>
                      company
                        .toLowerCase()
                        .includes(
                          search.trim().toLowerCase(),
                        ),
                    )
                    .slice(0, 3)
                    .join(" · ")}
                </div>
              )}
            </div>

            {/* ROLE */}
            <div className="relative min-w-0">
              <label
                htmlFor="role"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                Role
              </label>

              <input
                id="role"
                type="text"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                placeholder="e.g. Software Engineer"
                autoComplete="off"
                list="role-suggestions"
                className="
                  h-10
                  w-full
                  min-w-0
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  text-foreground
                  placeholder:text-muted
                  transition
                  duration-150
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent/10
                "
              />

              <datalist id="role-suggestions">
                {roleSuggestions.map((roleName) => (
                  <option
                    key={roleName}
                    value={roleName}
                  />
                ))}
              </datalist>

              {role.trim() && (
                <div className="mt-1 text-[10px] text-muted">
                  Try:{" "}
                  {roleSuggestions
                    .filter((roleName) =>
                      roleName
                        .toLowerCase()
                        .includes(
                          role.trim().toLowerCase(),
                        ),
                    )
                    .slice(0, 3)
                    .join(" · ")}
                </div>
              )}
            </div>

            {/* LEVEL */}
            <div className="min-w-0">
              <label
                htmlFor="level"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                Level
              </label>

              <select
                id="level"
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="
                  h-10
                  w-full
                  min-w-0
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  text-foreground
                  transition
                  duration-150
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent/10
                "
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

            {/* LOCATION */}
            <div className="min-w-0">
              <label
                htmlFor="location"
                className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-muted"
              >
                Location
              </label>

              <select
                id="location"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                className="
                  h-10
                  w-full
                  min-w-0
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-sm
                  text-foreground
                  transition
                  duration-150
                  focus:border-accent
                  focus:ring-2
                  focus:ring-accent/10
                "
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

          {/* SORT */}
          <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                Sort by
              </span>

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as SortOption,
                  )
                }
                className="
                  h-9
                  min-w-0
                  rounded-lg
                  border
                  border-border
                  bg-background
                  px-3
                  text-xs
                  text-foreground
                  focus:border-accent
                  focus:outline-none
                "
              >
                <option value="totalCompensation">
                  Total compensation
                </option>

                <option value="baseSalary">
                  Base salary
                </option>

                <option value="stock">Stock</option>

                <option value="bonus">Bonus</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  setOrder((current) =>
                    current === "desc"
                      ? "asc"
                      : "desc",
                  )
                }
                className="
                  h-9
                  rounded-lg
                  border
                  border-border
                  px-3
                  text-xs
                  text-muted
                  transition
                  duration-150
                  hover:border-accent
                  hover:text-accent
                "
              >
                {order === "desc"
                  ? "Highest first ↓"
                  : "Lowest first ↑"}
              </button>
            </div>

            <div className="text-xs text-muted">
              {selectedIds.length > 0
                ? `${selectedIds.length}/3 selected`
                : "Select up to 3 records"}
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE FILTERS */}
      {hasFilters && (
        <section className="animate-fade-up mx-auto max-w-7xl px-4 pt-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted">
              Active filters:
            </span>

            {search.trim() && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="max-w-full truncate rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted transition duration-150 hover:border-accent hover:text-accent"
              >
                Company: {search} ×
              </button>
            )}

            {role.trim() && (
              <button
                type="button"
                onClick={() => setRole("")}
                className="max-w-full truncate rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted transition duration-150 hover:border-accent hover:text-accent"
              >
                Role: {role} ×
              </button>
            )}

            {level && (
              <button
                type="button"
                onClick={() => setLevel("")}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted transition duration-150 hover:border-accent hover:text-accent"
              >
                Level: {level} ×
              </button>
            )}

            {location && (
              <button
                type="button"
                onClick={() => setLocation("")}
                className="rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-muted transition duration-150 hover:border-accent hover:text-accent"
              >
                Location: {location} ×
              </button>
            )}
          </div>
        </section>
      )}

      {/* RESULTS HEADER */}
      <section className="mx-auto max-w-7xl px-4 pb-3 pt-7 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Compensation Explorer
            </h2>

            {pagination && (
              <p className="mt-1 text-xs text-muted">
                {pagination.total} records · sorted by{" "}
                {sortLabel(sort).toLowerCase()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {data.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const headers = [
                    "Company",
                    "Role",
                    "Level",
                    "Location",
                    "Base Salary",
                    "Stock",
                    "Bonus",
                    "Total Compensation",
                    "Currency",
                  ];

                  const rows = data.map((record) => [
                    record.company.name,
                    record.role.name,
                    record.level.canonicalLevel,
                    `${record.location.city}, ${record.location.country}`,
                    Number(record.baseSalary),
                    Number(record.stock),
                    Number(record.bonus),
                    Number(record.totalCompensation),
                    record.currency,
                  ]);

                  const csv = [
                    headers,
                    ...rows,
                  ]
                    .map((row) =>
                      row
                        .map((value) => {
                          const stringValue =
                            String(value);

                          return `"${stringValue.replace(
                            /"/g,
                            '""',
                          )}"`;
                        })
                        .join(","),
                    )
                    .join("\n");

                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  });

                  const url =
                    URL.createObjectURL(blob);

                  const link =
                    document.createElement("a");

                  link.href = url;
                  link.download =
                    "compscope-compensation.csv";

                  document.body.appendChild(link);
                  link.click();
                  link.remove();

                  URL.revokeObjectURL(url);
                }}
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-border
                  bg-surface
                  px-3
                  text-xs
                  font-medium
                  text-muted-strong
                  transition
                  duration-150
                  hover:border-accent
                  hover:text-accent
                "
              >
                ↓ Export CSV
              </button>
            )}

            {selectedIds.length > 0 && (
              <Link
                href={`/compare?ids=${selectedIds.join(",")}`}
                className="
                  inline-flex
                  h-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-accent
                  px-4
                  text-xs
                  font-semibold
                  text-white
                  transition
                  duration-150
                  hover:bg-accent-hover
                  active:scale-[0.98]
                "
              >
                Compare selected ({selectedIds.length})
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* TOP COMPENSATION SNAPSHOT */}
      {!loading && chartData.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-5 sm:px-5">
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">
                Compensation snapshot
              </h2>

              <p className="mt-1 text-xs text-muted">
                Highest total compensation records currently
                visible.
              </p>
            </div>

            <div className="h-[260px] p-4 sm:h-[280px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    horizontal={false}
                    stroke="var(--border)"
                  />

                  <XAxis
                    type="number"
                    tickFormatter={formatCompact}
                    tick={{
                      fill: "var(--muted)",
                      fontSize: 10,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="company"
                    width={85}
                    tick={{
                      fill: "var(--foreground)",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "var(--accent-soft)",
                      opacity: 0.25,
                    }}
                    content={<CustomChartTooltip />}
                  />

                  <Bar
                    dataKey="total"
                    fill="var(--accent)"
                    radius={[0, 5, 5, 0]}
                    barSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-4 py-3 sm:px-5">
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          {loading ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-border border-t-accent" />

              <p className="mt-4 text-sm text-muted">
                Loading compensation data...
              </p>
            </div>
          ) : error ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm text-danger">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchCompensation}
                className="mt-4 rounded-lg border border-border px-4 py-2 text-xs text-muted transition hover:border-accent hover:text-accent"
              >
                Try again
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <p className="text-sm font-medium">
                No compensation records found.
              </p>

              <p className="mt-1 text-xs text-muted">
                Try removing one or more filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-xs font-medium text-accent hover:text-accent-hover"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted">
                  <tr className="text-[11px] uppercase tracking-wide text-muted">
                    <th className="w-12 px-4 py-3.5" />

                    <th className="px-4 py-3.5 font-medium">
                      Company
                    </th>

                    <th className="px-4 py-3.5 font-medium">
                      Role
                    </th>

                    <th className="px-4 py-3.5 font-medium">
                      Level
                    </th>

                    <th className="px-4 py-3.5 font-medium">
                      Location
                    </th>

                    <th className="px-4 py-3.5 text-right font-medium">
                      Base
                    </th>

                    <th className="px-4 py-3.5 text-right font-medium">
                      Stock
                    </th>

                    <th className="px-4 py-3.5 text-right font-medium">
                      Bonus
                    </th>

                    <th className="px-4 py-3.5 text-right font-medium">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {data.map((record) => {
                    const selected =
                      selectedIds.includes(record.id);

                    const selectionLimitReached =
                      selectedIds.length >= 3;

                    return (
                      <tr
                        key={record.id}
                        className={`
                          transition-all
                          duration-150
                          ${
                            selected
                              ? "bg-accent-soft"
                              : "hover:bg-surface-muted"
                          }
                        `}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selected}
                            disabled={
                              !selected &&
                              selectionLimitReached
                            }
                            onChange={() =>
                              toggleSelection(record.id)
                            }
                            aria-label={`Select ${record.company.name} ${record.role.name}`}
                            className="h-4 w-4 cursor-pointer accent-[var(--accent)] disabled:cursor-not-allowed"
                          />
                        </td>

                        <td className="px-4 py-4 font-medium">
                          {record.company.name}
                        </td>

                        <td className="px-4 py-4 text-muted-strong">
                          {record.role.name}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                            {record.level.canonicalLevel}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-muted-strong">
                          {record.location.city}
                        </td>

                        <td className="px-4 py-4 text-right">
                          {formatSalary(
                            record.baseSalary,
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-muted-strong">
                          {formatSalary(record.stock)}
                        </td>

                        <td className="px-4 py-4 text-right text-muted-strong">
                          {formatSalary(record.bonus)}
                        </td>

                        <td className="px-4 py-4 text-right font-semibold text-accent">
                          {formatSalary(
                            record.totalCompensation,
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
                disabled={page === 1 || loading}
                className="
                  rounded-lg
                  border
                  border-border
                  px-4
                  py-2
                  text-xs
                  text-muted
                  transition
                  duration-150
                  hover:border-accent
                  hover:text-accent
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                ← Previous
              </button>

              <button
                type="button"
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
                className="
                  rounded-lg
                  border
                  border-border
                  px-4
                  py-2
                  text-xs
                  text-muted
                  transition
                  duration-150
                  hover:border-accent
                  hover:text-accent
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border px-5 py-8 text-center text-xs text-muted">
        CompScope · Synthetic demo dataset · Compensation
        intelligence
      </footer>
    </main>
  );
}