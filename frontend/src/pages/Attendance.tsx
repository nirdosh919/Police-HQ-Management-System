import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Search,
  UserCheck,
  XCircle,
} from "lucide-react";

type Officer = {
  _id: string;
  fullName: string;
  employeeId: string;
  rank: string;
  department: string;
  serviceStatus: "Active" | "Suspended" | "Retired";
};

type AttendanceRecord = {
  _id: string;
  officerId: string;
  employeeId: string;
  officerName: string;
  department?: string;
  date: string;
  status: "Present" | "Absent" | "Leave";
  remarks?: string;
};

type Summary = {
  total: number;
  present: number;
  absent: number;
  leave: number;
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://police-hq-management-backend.onrender.com/api";

const getAuthHeaders = (): Record<string, string> => {
  const token =
    localStorage.getItem("phq_auth_token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function Attendance() {
  const [officers, setOfficers] =
    useState<Officer[]>([]);

  const [records, setRecords] =
    useState<AttendanceRecord[]>([]);

  const [summary, setSummary] =
    useState<Summary>({
      total: 0,
      present: 0,
      absent: 0,
      leave: 0,
    });

  const [date, setDate] =
    useState(today());

  const [statusFilter, setStatusFilter] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedOfficer, setSelectedOfficer] =
    useState("");

  const [status, setStatus] =
    useState<
      "Present" | "Absent" | "Leave"
    >("Present");

  const [remarks, setRemarks] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const loadOfficers = async () => {
    const response = await fetch(
      `${API}/officers?page=1&limit=1000`,
      {
        headers: getAuthHeaders(),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Unable to load officers"
      );
    }

    const data = Array.isArray(result.data)
      ? result.data
      : [];

    setOfficers(data);
  };

  const loadAttendance = async () => {
    const query =
      new URLSearchParams();

    if (date) {
      query.set("date", date);
    }

    if (statusFilter) {
      query.set(
        "status",
        statusFilter
      );
    }

    query.set("page", "1");
    query.set("limit", "500");

    const response = await fetch(
      `${API}/attendance?${query.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    const result =
      await response.json();

    if (
      !response.ok ||
      !result.success
    ) {
      throw new Error(
        result.message ||
          "Unable to load attendance"
      );
    }

    setRecords(
      Array.isArray(result.data)
        ? result.data
        : []
    );

    const summaryResponse =
      await fetch(
        `${API}/attendance/summary?date=${encodeURIComponent(
          date
        )}`,
        {
          headers: getAuthHeaders(),
        }
      );

    const summaryResult =
      await summaryResponse.json();

    if (
      summaryResponse.ok &&
      summaryResult.success &&
      summaryResult.data
    ) {
      setSummary(
        summaryResult.data
      );
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      await Promise.all([
        loadOfficers(),
        loadAttendance(),
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load attendance"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [date, statusFilter]);

  const visibleRecords =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return records;
      }

      return records.filter(
        (record) =>
          record.officerName
            .toLowerCase()
            .includes(value) ||
          record.employeeId
            .toLowerCase()
            .includes(value) ||
          (record.department || "")
            .toLowerCase()
            .includes(value)
      );
    }, [records, search]);

  const saveAttendance = async () => {
    if (!selectedOfficer) {
      setError(
        "Please select an officer."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            officerId:
              selectedOfficer,
            date,
            status,
            remarks:
              remarks.trim(),
          }),
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Unable to save attendance"
        );
      }

      setMessage(
        "Attendance saved successfully."
      );

      setRemarks("");

      await loadAttendance();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#C9A227]">
          Service Records
        </p>

        <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">
          Attendance
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Officer attendance and duty tracking.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {message}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total
            </p>
            <CalendarCheck
              size={20}
              className="text-[#C9A227]"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
            {summary.total}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Present
            </p>
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {summary.present}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Absent
            </p>
            <XCircle
              size={20}
              className="text-red-600"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {summary.absent}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Leave
            </p>
            <Clock3
              size={20}
              className="text-amber-600"
            />
          </div>
          <p className="mt-2 text-3xl font-bold text-amber-600">
            {summary.leave}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <UserCheck
            size={22}
            className="text-[#C9A227]"
          />
          <div>
            <h2 className="font-bold text-[#0B1F3A]">
              Mark Attendance
            </h2>
            <p className="text-xs text-slate-500">
              Record daily officer attendance
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Officer
            </label>
            <select
              value={selectedOfficer}
              onChange={(event) =>
                setSelectedOfficer(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            >
              <option value="">
                Select officer
              </option>

              {officers.map(
                (officer) => (
                  <option
                    key={officer._id}
                    value={officer._id}
                  >
                    {officer.fullName} —{" "}
                    {officer.employeeId}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Status
            </label>
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | "Present"
                    | "Absent"
                    | "Leave"
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            >
              <option value="Present">
                Present
              </option>
              <option value="Absent">
                Absent
              </option>
              <option value="Leave">
                Leave
              </option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              disabled={
                saving ||
                loading ||
                !selectedOfficer
              }
              onClick={() =>
                void saveAttendance()
              }
              className="w-full rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#132D50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save Attendance"}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-xs font-semibold text-slate-500">
            Remarks
          </label>

          <textarea
            value={remarks}
            onChange={(event) =>
              setRemarks(
                event.target.value
              )
            }
            rows={2}
            placeholder="Optional attendance remarks"
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
          />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-bold text-[#0B1F3A]">
              Attendance Records
            </h2>
            <p className="text-xs text-slate-500">
              Daily attendance records
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search officer..."
                className="rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">
                All Status
              </option>
              <option value="Present">
                Present
              </option>
              <option value="Absent">
                Absent
              </option>
              <option value="Leave">
                Leave
              </option>
            </select>
          </div>
        </div>

        {visibleRecords.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            No attendance records found for the selected date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Officer
                  </th>
                  <th className="px-5 py-3">
                    Employee ID
                  </th>
                  <th className="px-5 py-3">
                    Department
                  </th>
                  <th className="px-5 py-3">
                    Date
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Remarks
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visibleRecords.map(
                  (record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-[#0B1F3A]">
                        {record.officerName}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {record.employeeId}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {record.department ||
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {new Date(
                          record.date
                        ).toLocaleDateString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            record.status ===
                            "Present"
                              ? "bg-emerald-50 text-emerald-700"
                              : record.status ===
                                "Absent"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {record.remarks ||
                          "—"}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

