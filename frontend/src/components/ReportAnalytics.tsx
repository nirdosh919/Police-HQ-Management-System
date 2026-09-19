import { useEffect, useState } from "react";
import {
  BarChart3,
  Building2,
  MapPin,
  Award,
  ArrowRightLeft,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";

type ReportData = {
  total: number;
  active: number;
  suspended: number;
  retired: number;
  promotions: number;
  transfers: number;
  byDepartment: Record<string, number>;
  byDistrict: Record<string, number>;
  byRank: Record<string, number>;
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:5000/api";

export default function ReportAnalytics() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("phq_auth_token");

    fetch(`${API}/reports/overview`, {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load analytics"
          );
        }

        setData(result.data);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load analytics"
        );
      });
  }, []);

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          Loading report analytics...
        </p>
      </div>
    );
  }

  const cards = [
    ["Total Officers", data.total, Users],
    ["Active", data.active, UserCheck],
    ["Suspended", data.suspended, UserX],
    ["Retired", data.retired, Users],
    ["Transfers", data.transfers, ArrowRightLeft],
    ["Promotions", data.promotions, Award],
  ] as const;

  const groups = [
    ["Departments", data.byDepartment, Building2],
    ["Districts", data.byDistrict, MapPin],
    ["Ranks", data.byRank, Award],
  ] as const;

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 size={20} className="text-[#C9A227]" />
        <div>
          <h2 className="font-bold text-[#0B1F3A]">
            Live Report Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Current database statistics
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value, Icon]) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{title}</p>
                <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
                  {value}
                </p>
              </div>
              <Icon
                size={23}
                className="text-[#C9A227]"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {groups.map(([title, values, Icon]) => (
          <div
            key={title}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <Icon
                size={18}
                className="text-[#C9A227]"
              />
              <h3 className="font-bold text-[#0B1F3A]">
                {title}
              </h3>
            </div>

            <div className="space-y-3">
              {Object.entries(values)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([name, count]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="truncate text-slate-600">
                        {name}
                      </span>
                      <span className="font-semibold text-[#0B1F3A]">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#0B1F3A]"
                        style={{
                          width: `${Math.max(
                            4,
                            Math.round(
                              (count /
                                Math.max(1, data.total)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
