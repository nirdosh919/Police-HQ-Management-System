import { useEffect, useState } from "react";
import OfficerProfile from "../components/OfficerProfile";

interface Department {
  _id: string;
  name: string;
  code: string; officerCount?: number;
  description?: string;
  head?: string;
  headquarters?: string;
  contactNumber?: string;
  email?: string;
  status: "Active" | "Inactive";
}

const API = `${window.location.protocol}//${window.location.hostname}:5000/api/departments`;

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [departmentOfficers, setDepartmentOfficers] = useState<any[]>([]);
  const [officersLoading, setOfficersLoading] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);

  const emptyForm = {
    name: "",
    code: "",
    description: "",
    head: "",
    headquarters: "",
    contactNumber: "",
    email: "",
    status: "Active",
  };

  const [form, setForm] = useState(emptyForm);

  const token = localStorage.getItem("phq_auth_token");

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search) params.set("search", search);
      if (status) params.set("status", status);

      const response = await fetch(`${API}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setDepartments(result.data);
      }
    } catch (error) {
      console.error("Department loading error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, [search, status]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (department: Department) => {
    setEditing(department);
    setForm({
      name: department.name || "",
      code: department.code || "",
      description: department.description || "",
      head: department.head || "",
      headquarters: department.headquarters || "",
      contactNumber: department.contactNumber || "",
      email: department.email || "",
      status: department.status || "Active",
    });
    setShowModal(true);
  };

  const saveDepartment = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      alert("Department Name and Code are required.");
      return;
    }

    try {
      const response = await fetch(
        editing ? `${API}/${editing._id}` : API,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Operation failed");
        return;
      }

      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadDepartments();
    } catch (error) {
      console.error(error);
      alert("Unable to save department.");
    }
  };

  const viewDepartmentOfficers = async (id: string) => {
    setSelectedDepartmentId(id);
    setOfficersLoading(true);
    try {
      const token = localStorage.getItem("phq_auth_token");
      const response = await fetch("http://127.0.0.1:5000/api/departments/" + id + "/officers", {
        headers: token ? { Authorization: "Bearer " + token } : {},
      });
      const result = await response.json();
      setDepartmentOfficers(result.success ? result.data || [] : []);
    } catch (error) {
      console.error("Department officers loading error:", error);
      setDepartmentOfficers([]);
    } finally {
      setOfficersLoading(false);
    }
  };
  const deleteDepartment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Delete failed");
        return;
      }

      loadDepartments();
    } catch (error) {
      console.error(error);
      alert("Unable to delete department.");
    }
  };

  const total = departments.length;
  const active = departments.filter((d) => d.status === "Active").length;
  const inactive = departments.filter((d) => d.status === "Inactive").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-gray-500">
            Manage police departments and organizational units.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          + Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Departments</p>
          <h2 className="text-3xl font-bold mt-2">{total}</h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Active Departments</p>
          <h2 className="text-3xl font-bold mt-2">{active}</h2>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Inactive Departments</p>
          <h2 className="text-3xl font-bold mt-2">{inactive}</h2>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department, code or head..."
            className="flex-1 border rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-4 py-2.5"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearch("");
              setStatus("");
            }}
            className="border rounded-lg px-5 py-2.5 hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-5 py-4">Code</th>
                <th className="text-left px-5 py-4">Department</th>
                <th>Officers</th><th>Head</th>
                <th className="text-left px-5 py-4">Headquarters</th>
                <th className="text-left px-5 py-4">Contact</th>
                <th className="text-left px-5 py-4">Status</th>
                <th className="text-right px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
  {loading ? (
    <tr>
      <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
        Loading departments...
      </td>
    </tr>
  ) : departments.length === 0 ? (
    <tr>
      <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
        No departments found.
      </td>
    </tr>
  ) : (
    departments.map((department) => (
      <tr key={department._id} className="hover:bg-gray-50">
        <td className="px-5 py-4">
          {department.code}
        </td>

        <td className="px-5 py-4 font-medium">
          {department.name}
        </td>

        <td className="px-5 py-4">
          <div className="flex items-center gap-2">
            <strong>{department.officerCount ?? 0}</strong>
            <button
              onClick={() => viewDepartmentOfficers(department._id)}
              className="px-3 py-1.5 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
            >
              View Officers
            </button>
          </div>
        </td>

        <td className="px-5 py-4">
          {department.head || "—"}
        </td>

        <td className="px-5 py-4">
          {department.headquarters || "—"}
        </td>

        <td className="px-5 py-4">
          {department.contactNumber || "—"}
        </td>

        <td className="px-5 py-4">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              department.status === "Active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {department.status}
          </span>
        </td>

        <td className="px-5 py-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openEdit(department)}
              className="px-3 py-1.5 border rounded-lg hover:bg-gray-50"
            >
              Edit
            </button>

            <button
              onClick={() => deleteDepartment(department._id)}
              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">
                  {editing ? "Edit Department" : "Add Department"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Enter department information below.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-800 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                placeholder="Department Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="border rounded-lg px-4 py-2.5"
              />

              <input
                placeholder="Department Code *"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="border rounded-lg px-4 py-2.5"
              />

              <input
                placeholder="Department Head"
                value={form.head}
                onChange={(e) => setForm({ ...form, head: e.target.value })}
                className="border rounded-lg px-4 py-2.5"
              />

              <input
                placeholder="Headquarters"
                value={form.headquarters}
                onChange={(e) =>
                  setForm({ ...form, headquarters: e.target.value })
                }
                className="border rounded-lg px-4 py-2.5"
              />

              <input
                placeholder="Contact Number"
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                className="border rounded-lg px-4 py-2.5"
              />

              <input
                placeholder="Official Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border rounded-lg px-4 py-2.5"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="border rounded-lg px-4 py-2.5"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="border rounded-lg px-4 py-2.5 md:col-span-2 min-h-24"
              />
            </div>

            <div className="flex justify-end gap-3 p-6 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={saveDepartment}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editing ? "Update Department" : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedOfficer && <OfficerProfile officer={selectedOfficer} onClose={() => setSelectedOfficer(null)} />}

      {selectedDepartmentId && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
    <div className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

      <div className="flex items-center justify-between border-b px-6 py-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Department Officers
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Officers currently assigned to this department
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDepartmentId(null);
            setDepartmentOfficers([]);
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          ×
        </button>
      </div>

      <div className="max-h-[65vh] overflow-auto p-6">

        {officersLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-sm text-slate-500">
              Loading officers...
            </div>
          </div>
        ) : departmentOfficers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 py-16">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl">
              👮
            </div>

            <h3 className="text-base font-semibold text-slate-700">
              No officers found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              There are no officers assigned to this department.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">

              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Designation
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    District
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {departmentOfficers.map((officer) => (
                  <tr
                    key={officer._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-slate-600">
                      {officer.employeeId || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <button onClick={() => setSelectedOfficer(officer)} className="font-semibold text-blue-600 hover:text-blue-800 hover:underline">{officer.fullName || "-"}</button>
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {officer.rank || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {officer.designation || "-"}
                    </td>

                    <td className="px-4 py-4 text-slate-600">
                      {officer.district || "-"}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          officer.serviceStatus === "Active"
                            ? "bg-green-100 text-green-700"
                            : officer.serviceStatus === "Suspended"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
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

      <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
        <button
          onClick={() => {
            setSelectedDepartmentId(null);
            setDepartmentOfficers([]);
          }}
          className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
      </div>
  );
}







