import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Building2,
  ShieldCheck,
  Activity,
  RefreshCw,
  AlertCircle
} from "lucide-react";

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000/api`;

interface Officer {
  _id?: string;
  fullName?: string;
  employeeId?: string;
  rank?: string;
  department?: string;
  district?: string;
  serviceStatus?: string;
}

interface Department {
  _id?: string;
  name?: string;
  status?: string;
}

function extractArray(value: any, key: string): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.[key])) return value[key];
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.items)) return value.items;
  return [];
}

async function getApiData(url: string) {
  const token = localStorage.getItem("phq_auth_token");

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${text || response.statusText}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Server returned invalid JSON.");
  }
}

export default function Dashboard() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [officerResponse, departmentResponse] = await Promise.all([
        getApiData(`${API_BASE}/officers`),
        getApiData(`${API_BASE}/departments`)
      ]);

      const officerList = extractArray(officerResponse, "officers");
      const departmentList = extractArray(departmentResponse, "departments");

      setOfficers(officerList);
      setDepartments(departmentList);

      console.log("Police HQ Officers:", officerList);
      console.log("Police HQ Departments:", departmentList);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Unable to load officer data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalOfficers = officers.length;

  const activeOfficers = officers.filter(
    (o) => String(o.serviceStatus || "").toLowerCase() === "active"
  ).length;

  const suspendedOfficers = officers.filter(
    (o) => String(o.serviceStatus || "").toLowerCase() === "suspended"
  ).length;

  const retiredOfficers = officers.filter(
    (o) => String(o.serviceStatus || "").toLowerCase() === "retired"
  ).length;

  const ranks = new Set(
    officers.map((o) => o.rank).filter(Boolean)
  ).size;

  const districts = new Set(
    officers.map((o) => o.district).filter(Boolean)
  ).size;

  const activePercentage =
    totalOfficers > 0
      ? Math.round((activeOfficers / totalOfficers) * 100)
      : 0;

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-sm text-slate-500 mb-1">
            Police Headquarters
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-1">
            Live operational overview
          </p>
        </div>

        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} />
          <div>
            <div className="font-semibold">Dashboard error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <div className="phq-dashboard-panel rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Officers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : totalOfficers}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Registered officers
              </p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-yellow-400">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="phq-dashboard-panel rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Officers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : activeOfficers}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {activePercentage}% of total
              </p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-yellow-400">
              <UserCheck size={25} />
            </div>
          </div>
        </div>

        <div className="phq-dashboard-panel rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Departments
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : departments.length}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Active officer departments
              </p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-yellow-400">
              <Building2 size={25} />
            </div>
          </div>
        </div>

        <div className="phq-dashboard-panel rounded-md bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Retired Officers
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : retiredOfficers}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {totalOfficers > 0
                  ? Math.round((retiredOfficers / totalOfficers) * 100)
                  : 0}
                % of total
              </p>
            </div>
            <div className="rounded-md bg-slate-900 p-3 text-yellow-400">
              <UserX size={25} />
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        <div className="phq-dashboard-panel rounded-md bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Service Status
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Current officer distribution
              </p>
            </div>
            <ShieldCheck className="text-yellow-600" size={25} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md bg-green-50 p-5 border border-green-100">
              <p className="text-sm text-slate-600">Active</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {activeOfficers}
              </p>
            </div>

            <div className="rounded-md bg-yellow-50 p-5 border border-yellow-100">
              <p className="text-sm text-slate-600">Suspended</p>
              <p className="mt-2 text-3xl font-bold text-yellow-700">
                {suspendedOfficers}
              </p>
            </div>

            <div className="rounded-md bg-red-50 p-5 border border-red-100">
              <p className="text-sm text-slate-600">Retired</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {retiredOfficers}
              </p>
            </div>
          </div>
        </div>

        <div className="phq-dashboard-panel rounded-md bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                System Summary
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Live database overview
              </p>
            </div>
            <Activity className="text-yellow-600" size={25} />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Ranks</span>
              <strong>{ranks}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Districts</span>
              <strong>{districts}</strong>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Departments</span>
              <strong>{departments.length}</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Database Status</span>
              <span className="font-semibold text-green-700">
                {error ? "API Error" : loading ? "Checking..." : "Connected"}
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="phq-dashboard-panel rounded-md bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Department Overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Departments fetched from database
            </p>
          </div>
          <Building2 className="text-yellow-600" size={25} />
        </div>

        {departments.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {departments.slice(0, 9).map((department, index) => (
              <div
                key={department._id || `${department.name}-${index}`}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="font-semibold text-slate-800">
                  {department.name || "Unnamed Department"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Status: {department.status || "Active"}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            {loading ? "Loading departments..." : "No department records found."}
          </div>
        )}
      </div>

      <div className="phq-dashboard-panel rounded-md bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Officer Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Records fetched directly from the Police HQ database
            </p>
          </div>
          <Users className="text-yellow-600" size={25} />
        </div>

        {officers.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Employee ID</th>
                  <th>Rank</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {officers.slice(0, 10).map((officer, index) => (
                  <tr key={officer._id || `${officer.employeeId}-${index}`}>
                    <td className="font-semibold">
                      {officer.fullName || "—"}
                    </td>
                    <td>{officer.employeeId || "—"}</td>
                    <td>{officer.rank || "—"}</td>
                    <td>{officer.department || "—"}</td>
                    <td>{officer.serviceStatus || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            {loading ? "Loading officer records..." : "No officer records found."}
          </div>
        )}
      </div>

    </div>
  );
}
