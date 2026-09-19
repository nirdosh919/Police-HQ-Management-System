import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { getRecentActivity } from "../services/activityApi";
import type { AuditLog } from "../services/activityApi";

export default function RecentActivity() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getRecentActivity(8)
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((error) => {
        console.error("RECENT ACTIVITY ERROR:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-[#0B1F3A] p-2 text-white">
          <Activity size={18} />
        </div>

        <div>
          <h3 className="font-bold text-[#0B1F3A]">
            Recent Activity
          </h3>

          <p className="text-xs text-slate-400">
            Latest administrative actions
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">
          Loading activity...
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">
          No recent activity
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-start justify-between rounded-xl bg-slate-50 p-3"
            >
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {item.action}
                </p>

                <p className="text-xs text-slate-500">
                  {item.userName || item.userEmail || "System"} ·{" "}
                  {item.module}
                </p>
              </div>

              <span className="whitespace-nowrap text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
