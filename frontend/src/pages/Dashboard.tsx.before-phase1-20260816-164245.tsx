import { useEffect, useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserRoundCheck,
  Building2,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

type Officer = {
  _id?: string;
  fullName: string;
  employeeId: string;
  rank: string;
  department: string;
  serviceStatus: "Active" | "Suspended" | "Retired";
  createdAt?: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Officer[];
  officers?: Officer[];
  total?: number;
};

const API_BASE_URL =
  `${window.location.protocol}//${window.location.hostname}:5000/api`;

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function percentage(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 10) / 10;
}

export default function Dashboard() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/officers?page=1&limit=1000`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch officers (${response.status})`);
      }

      const result: ApiResponse = await response.json();

      const records =
        Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.officers)
            ? result.officers
            : [];

      setOfficers(records);
    } catch (err) {
      console.error("Dashboard fetch error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const total = officers.length;

  const active = officers.filter(
    (officer) => officer.serviceStatus === "Active"
  ).length;

  const suspended = officers.filter(
    (officer) => officer.serviceStatus === "Suspended"
  ).length;

  const retired = officers.filter(
    (officer) => officer.serviceStatus === "Retired"
  ).length;

  const departments = useMemo(() => {
    const map = new Map<string, number>();

    officers.forEach((officer) => {
      const department =
        officer.department?.trim() || "Unassigned";

      map.set(
        department,
        (map.get(department) || 0) + 1
      );
    });

    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [officers]);

  const maxDepartmentCount = Math.max(
    ...departments.map((item) => item.count),
    1
  );

  const recentOfficers = useMemo(() => {
    return [...officers]
      .sort((a, b) => {
        const first = a.createdAt
          ? new Date(a.createdAt).getTime()
          : 0;

        const second = b.createdAt
          ? new Date(b.createdAt).getTime()
          : 0;

        return second - first;
      })
      .slice(0, 6);
  }, [officers]);

  const cards = [
    {
      title: "Total Officers",
      value: total,
      subtitle: "Registered officers",
      icon: Users,
    },
    {
      title: "Active Officers",
      value: active,
      subtitle: `${percentage(active, total)}% of total`,
      icon: UserCheck,
    },
    {
      title: "Departments",
      value: departments.length,
      subtitle: "Departments with officers",
      icon: Building2,
    },
    {
      title: "Retired Officers",
      value: retired,
      subtitle: `${percentage(retired, total)}% of total`,
      icon: UserRoundCheck,
    },
  ];

  return (
    <div>
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Police Headquarters
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Live Officer Management System overview
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadDashboard()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <strong>Dashboard error:</strong> {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-[#0B1F3A]">
                    {loading
                      ? "—"
                      : formatNumber(card.value)}
                  </h2>

                  <p className="mt-2 text-xs text-slate-400">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#0B1F3A]">
                Officers by Department
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Live database distribution
              </p>
            </div>

            <TrendingUp
              size={20}
              className="text-[#C9A227]"
            />
          </div>

          {loading ? (
            <div className="mt-8 text-sm text-slate-400">
              Loading department statistics...
            </div>
          ) : departments.length ? (
            <div className="mt-7 space-y-5">
              {departments
                .slice(0, 8)
                .map((department) => {
                  const width =
                    (department.count /
                      maxDepartmentCount) *
                    100;

                  return (
                    <div key={department.name}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">
                          {department.name}
                        </span>

                        <span className="font-bold text-[#0B1F3A]">
                          {formatNumber(department.count)}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#0B1F3A] transition-all duration-700"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="mt-8 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">
              No department data available.
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-[#0B1F3A]">
                Service Status
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current officer status
              </p>
            </div>

            <ShieldCheck
              size={20}
              className="text-[#C9A227]"
            />
          </div>

          <div className="mt-7 flex justify-center">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-[#0B1F3A]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0B1F3A]">
                  {loading
                    ? "—"
                    : `${percentage(active, total)}%`}
                </p>

                <p className="text-xs text-slate-400">
                  Active
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-[#0B1F3A]" />
                Active
              </span>

              <strong>{formatNumber(active)}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Suspended
              </span>

              <strong>{formatNumber(suspended)}</strong>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                Retired
              </span>

              <strong>{formatNumber(retired)}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="font-bold text-[#0B1F3A]">
            Recently Added Officers
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest records from MongoDB
          </p>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-slate-400">
            Loading recent officers...
          </div>
        ) : recentOfficers.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentOfficers.map((officer) => (
              <div
                key={officer._id || officer.employeeId}
                className="rounded-lg border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#0B1F3A]">
                      {officer.fullName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {officer.employeeId}
                    </p>
                  </div>

                  <span className="rounded-full bg-[#0B1F3A] px-2.5 py-1 text-[10px] font-semibold text-white">
                    {officer.rank}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>{officer.department}</span>

                  <span className="font-semibold">
                    {officer.serviceStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">
            No officers found.
          </div>
        )}
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5 text-center text-[11px] text-slate-400">
        Police Headquarters Officer Management System
        <span className="mx-2">•</span>
        Live MongoDB Data
      </div>
    </div>
  );
}

