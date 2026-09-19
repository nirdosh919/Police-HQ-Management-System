import { useEffect, useMemo, useState } from "react";
import OfficerProfile from "../components/OfficerProfile";

interface PoliceStation {
  _id: string;
  name: string;
  code: string;
  state?: string;
  district?: string;
  headquarters?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  officerInCharge?: string;
  description?: string;
  status: "Active" | "Inactive";
  officerCount?: number;
}

const API = `${window.location.protocol}//${window.location.hostname}:5000/api/police-stations`;

const emptyForm = {
  name: "",
  code: "",
  state: "",
  district: "",
  headquarters: "",
  address: "",
  contactNumber: "",
  email: "",
  officerInCharge: "",
  description: "",
  status: "Active" as "Active" | "Inactive"
};

export default function PoliceStations() {
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<PoliceStation | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [officers, setOfficers] = useState<any[]>([]);
  const [officersModal, setOfficersModal] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any | null>(null);

  const token = localStorage.getItem("phq_auth_token");

  const headers = {
    Authorization: token ? `Bearer ${token}` : ""
  };

  const loadStations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, { headers });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load police stations");
      }

      setStations(result.data || []);
    } catch (e: any) {
      setError(e.message || "Failed to load police stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return stations;

    return stations.filter((station) =>
      [
        station.name,
        station.code,
        station.state,
        station.district,
        station.headquarters,
        station.officerInCharge,
        station.status
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    );
  }, [stations, search]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };

  const openEdit = (station: PoliceStation) => {
    setEditing(station);

    setForm({
      name: station.name || "",
      code: station.code || "",
      state: station.state || "",
      district: station.district || "",
      headquarters: station.headquarters || "",
      address: station.address || "",
      contactNumber: station.contactNumber || "",
      email: station.email || "",
      officerInCharge: station.officerInCharge || "",
      description: station.description || "",
      status: station.status || "Active"
    });

    setModal(true);
  };

  const saveStation = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      alert("Station Name and Code are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        editing ? `${API}/${editing._id}` : API,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            ...headers,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(form)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save police station");
      }

      setModal(false);
      await loadStations();
    } catch (e: any) {
      alert(e.message || "Failed to save police station");
    } finally {
      setSaving(false);
    }
  };

  const deleteStation = async (station: PoliceStation) => {
    if (!window.confirm(`Delete ${station.name}?`)) return;

    try {
      const response = await fetch(`${API}/${station._id}`, {
        method: "DELETE",
        headers
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete police station");
      }

      await loadStations();
    } catch (e: any) {
      alert(e.message || "Failed to delete police station");
    }
  };

  const viewOfficers = async (station: PoliceStation) => {
    try {
      setOfficersModal(true);
      setOfficers([]);

      const response = await fetch(`${API}/${station._id}/officers`, {
        headers
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load officers");
      }

      setOfficers(result.data || []);
    } catch (e: any) {
      alert(e.message || "Failed to load officers");
      setOfficersModal(false);
    }
  };

  const total = stations.length;
  const active = stations.filter((s) => s.status === "Active").length;
  const inactive = stations.filter((s) => s.status === "Inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Police Stations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage police stations, postings and station officers.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-blue-700"
        >
          + Add Police Station
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Stations</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{active}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="mt-2 text-3xl font-bold text-rose-600">{inactive}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search station, code, district, HQ or officer..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {error && (
          <div className="m-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading police stations...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No police stations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Police Station</th>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">SHO / In-Charge</th>
                  <th className="px-5 py-4">Officers</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((station) => (
                  <tr key={station._id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{station.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {station.headquarters || "HQ not assigned"}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-xs text-slate-600">
                      {station.code}
                    </td>

                    <td className="px-5 py-4">
                      <p>{station.district || "-"}</p>
                      <p className="text-xs text-slate-500">{station.state || "-"}</p>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {station.officerInCharge || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => viewOfficers(station)}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {station.officerCount || 0} Officer(s)
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          station.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {station.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(station)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteStation(station)}
                          className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editing ? "Edit Police Station" : "Add Police Station"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter station administrative details.
                </p>
              </div>

              <button
                onClick={() => setModal(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {[
                ["name", "Station Name", true],
                ["code", "Station Code", true],
                ["state", "State", false],
                ["district", "District", false],
                ["headquarters", "Headquarters", false],
                ["officerInCharge", "SHO / Officer In-Charge", false],
                ["contactNumber", "Contact Number", false],
                ["email", "Email", false]
              ].map(([key, label, required]) => (
                <label key={key as string} className="space-y-1">
                  <span className="text-sm font-medium text-slate-700">
                    {label as string} {required && <span className="text-rose-500">*</span>}
                  </span>

                  <input
                    value={(form as any)[key as string]}
                    onChange={(e) =>
                      setForm((current) => ({
                        ...current,
                        [key as string]: e.target.value
                      }))
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </label>
              ))}

              <label className="space-y-1">
                <span className="text-sm font-medium text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      status: e.target.value as "Active" | "Inactive"
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Address</span>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      address: e.target.value
                    }))
                  }
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </label>

              <label className="space-y-1 md:col-span-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      description: e.target.value
                    }))
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t bg-slate-50 p-5">
              <button
                onClick={() => setModal(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={saveStation}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-slate-900 disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Update Station" : "Create Station"}
              </button>
            </div>
          </div>
        </div>
      )}

      {officersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Station Officers</h2>
                <p className="text-sm text-slate-500">
                  Officers currently posted at this police station.
                </p>
              </div>

              <button
                onClick={() => setOfficersModal(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            {officers.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No officers currently assigned to this station.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-5 py-4">Officer</th>
                      <th className="px-5 py-4">Employee ID</th>
                      <th className="px-5 py-4">Rank</th>
                      <th className="px-5 py-4">Department</th>
                      <th className="px-5 py-4">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {officers.map((officer: any) => (
                      <tr key={officer._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedOfficer(officer)}
                            className="font-semibold text-blue-600 hover:underline"
                          >
                            {officer.fullName || "-"}
                          </button>
                        </td>
                        <td className="px-5 py-4">{officer.employeeId || "-"}</td>
                        <td className="px-5 py-4">{officer.rank || "-"}</td>
                        <td className="px-5 py-4">{officer.department || "-"}</td>
                        <td className="px-5 py-4">{officer.serviceStatus || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="border-t bg-slate-50 p-4 text-right">
              <button
                onClick={() => setOfficersModal(false)}
                className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-semibold text-slate-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOfficer && (
        <OfficerProfile
          officer={selectedOfficer}
          onClose={() => setSelectedOfficer(null)}
        />
      )}
    </div>
  );
}

