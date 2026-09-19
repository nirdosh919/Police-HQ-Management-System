import { useEffect, useState } from "react";
import { Building2, Edit, Eye, Plus, Search, Trash2, X } from "lucide-react";
import OfficerProfile from "../components/OfficerProfile";

interface HeadquartersData {
  _id: string;
  name: string;
  code: string;
  state?: string;
  district?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
  description?: string;
  status: "Active" | "Inactive";
  officerCount?: number;
}

const API = `${window.location.protocol}//${window.location.hostname}:5000/api/headquarters`;

const emptyForm = {
  name: "",
  code: "",
  state: "",
  district: "",
  address: "",
  contactNumber: "",
  email: "",
  description: "",
  status: "Active" as "Active" | "Inactive",
};

export default function Headquarters() {
  const [headquarters, setHeadquarters] = useState<HeadquartersData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<HeadquartersData | null>(null);
  const [form, setForm] = useState(emptyForm);

  const [officers, setOfficers] = useState<any[]>([]);
  const [showOfficers, setShowOfficers] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any | null>(null);
  const [officersLoading, setOfficersLoading] = useState(false);

  const token = localStorage.getItem("phq_auth_token");

  const loadHeadquarters = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load headquarters");
      }

      setHeadquarters(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to load headquarters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeadquarters();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: HeadquartersData) => {
    setEditing(item);
    setForm({
      name: item.name || "",
      code: item.code || "",
      state: item.state || "",
      district: item.district || "",
      address: item.address || "",
      contactNumber: item.contactNumber || "",
      email: item.email || "",
      description: item.description || "",
      status: item.status || "Active",
    });
    setShowModal(true);
  };

  const saveHeadquarters = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.code.trim()) {
      alert("Headquarters name and code are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        editing ? `${API}/${editing._id}` : API,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save headquarters");
      }

      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      await loadHeadquarters();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to save headquarters");
    } finally {
      setSaving(false);
    }
  };

  const deleteHeadquarters = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this headquarters?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete headquarters");
      }

      await loadHeadquarters();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to delete headquarters");
    }
  };

  const viewOfficers = async (item: HeadquartersData) => {
    try {
      setShowOfficers(true);
      setOfficersLoading(true);
      setSelectedOfficer(null);

      const response = await fetch(`${API}/${item._id}/officers`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load officers");
      }

      setOfficers(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Unable to load officers");
      setOfficers([]);
    } finally {
      setOfficersLoading(false);
    }
  };

  const filtered = headquarters.filter((item) => {
    const value = `${item.name} ${item.code} ${item.state || ""} ${item.district || ""}`
      .toLowerCase();

    return value.includes(search.toLowerCase());
  });

  const total = headquarters.length;
  const active = headquarters.filter((item) => item.status === "Active").length;
  const inactive = headquarters.filter((item) => item.status === "Inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-700">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Headquarters
              </h1>
              <p className="text-sm text-slate-500">
                Manage police headquarters and administrative locations.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add Headquarters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Headquarters</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{total}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{active}</p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Inactive</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{inactive}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b p-5 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Headquarters Directory
          </h2>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search headquarters..."
              className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading headquarters...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="mx-auto text-slate-300" size={42} />
            <p className="mt-3 font-medium text-slate-700">
              No headquarters found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Add your first headquarters to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50">
                <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Headquarters</th>
                  <th className="px-5 py-4">Code</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4">Officers</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {item.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.email || "No email"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {item.code}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {[item.district, item.state].filter(Boolean).join(", ") || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">
                        {item.officerCount ?? 0}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => viewOfficers(item)}
                          className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-100"
                          title="View Officers"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEdit(item)}
                          className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100"
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => deleteHeadquarters(item._id)}
                          className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={17} />
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editing ? "Edit Headquarters" : "Add Headquarters"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter headquarters information below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveHeadquarters} className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["name", "Headquarters Name", "e.g. Police Headquarters"],
                  ["code", "Code", "e.g. PHQ-001"],
                  ["state", "State", "e.g. Uttar Pradesh"],
                  ["district", "District", "e.g. Lucknow"],
                  ["contactNumber", "Contact Number", "Enter contact number"],
                  ["email", "Email", "official@example.com"],
                ].map(([key, label, placeholder]) => (
                  <div key={key}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {label}
                      {(key === "name" || key === "code") && (
                        <span className="text-red-500"> *</span>
                      )}
                    </label>

                    <input
                      value={form[key as keyof typeof form]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [key]: e.target.value,
                        })
                      }
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  rows={3}
                  placeholder="Complete headquarters address"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Headquarters description"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as "Active" | "Inactive",
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving ? "Saving..." : editing ? "Update Headquarters" : "Create Headquarters"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOfficers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Headquarters Officers
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Officers currently assigned to this headquarters.
                </p>
              </div>

              <button
                onClick={() => setShowOfficers(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {officersLoading ? (
                <div className="py-10 text-center text-sm text-slate-500">
                  Loading officers...
                </div>
              ) : officers.length === 0 ? (
                <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-10 text-center">
                  <p className="font-medium text-slate-700">
                    No officers assigned
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    No officer is currently linked to this headquarters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead className="bg-slate-50">
                      <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3">Officer</th>
                        <th className="px-4 py-3">Employee ID</th>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {officers.map((officer) => (
                        <tr
                          key={officer._id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setSelectedOfficer(officer)}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {officer.fullName || "-"}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {officer.employeeId || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {officer.rank || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {officer.department || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              {officer.serviceStatus || "-"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
