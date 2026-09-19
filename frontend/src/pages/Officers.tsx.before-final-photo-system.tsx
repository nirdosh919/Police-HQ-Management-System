import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import AddOfficerModal from "../components/AddOfficerModal";
import EditOfficerModal from "../components/EditOfficerModal";

import {
  createOfficer,
  deleteOfficer,
  getOfficerById,
  getOfficers,
  updateOfficer,
  type Officer as ApiOfficer,
} from "../services/officerApi";

type OfficerStatus = "Active" | "Suspended" | "Retired";

type OfficerRow = {
  id: string;
  name: string;
  beltNumber: string;
  rank: string;
  department: string;
  headquarters: string;
  district: string;
  mobile: string;
  status: OfficerStatus;
  mongoId?: string;
  photograph?: string;
};

const demoOfficers: OfficerRow[] = [
  {
    id: "PHQ-10245",
    name: "Raj Kumar",
    beltNumber: "BK-10245",
    rank: "Inspector",
    department: "Crime Branch",
    headquarters: "Police Headquarters",
    district: "Kanpur Nagar",
    mobile: "98XXXXXX21",
    status: "Active",
  },
  {
    id: "PHQ-11482",
    name: "Anita Sharma",
    beltNumber: "BK-11482",
    rank: "Sub Inspector",
    department: "Cyber Cell",
    headquarters: "Lucknow HQ",
    district: "Lucknow",
    mobile: "97XXXXXX42",
    status: "Active",
  },
];

const ranks = [
  "All Ranks",
  "DSP",
  "Inspector",
  "Sub Inspector",
  "Assistant Sub Inspector",
  "Head Constable",
  "Constable",
];

const departments = [
  "All Departments",
  "DGP Office",
  "ADGP",
  "IG",
  "DIG",
  "SSP/SP Office",
  "ASP",
  "DSP/CO",
  "Inspector",
  "Sub Inspector",
  "Crime Branch",
  "Cyber Cell",
  "Traffic Police",
  "Intelligence",
  "Special Task Force",
  "Women Cell",
  "Anti Corruption",
  "CID",
  "ATS",
  "PCR",
  "Control Room",
  "Training Department",
  "Administration",
  "Accounts",
  "IT Cell",
  "Legal Cell",
];

const districts = [
  "All Districts",
  "Kanpur Nagar",
  "Kanpur Dehat",
  "Lucknow",
  "Jhansi",
  "Jalaun",
];

const statuses = [
  "All Status",
  "Active",
  "Suspended",
  "Retired",
];

function convertApiOfficer(officer: ApiOfficer): OfficerRow {
  return {
    id: officer.employeeId,
    name: officer.fullName,
    beltNumber: officer.beltNumber || "Not Assigned",
    rank: officer.rank,
    department: officer.department,
    headquarters: officer.headquarters || "Not Assigned",
    district: officer.district || "Not Assigned",
    mobile: officer.mobileNumber || "Not Available",
    status: officer.serviceStatus,
    mongoId: officer._id,
    photograph: officer.photograph,
  };
}

export default function Officers() {
  const [officerList, setOfficerList] =
    useState<OfficerRow[]>(demoOfficers);

  const [search, setSearch] = useState("");
  const [rank, setRank] = useState("All Ranks");
  const [department, setDepartment] =
    useState("All Departments");
  const [district, setDistrict] =
    useState("All Districts");
  const [status, setStatus] =
    useState("All Status");

  const [showFilters, setShowFilters] =
    useState(false);

  const [showAddOfficer, setShowAddOfficer] =
    useState(false);

  const [selectedOfficer, setSelectedOfficer] =
    useState<ApiOfficer | null>(null);

  const [showEditOfficer, setShowEditOfficer] =
    useState(false);

  const [showViewOfficer, setShowViewOfficer] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadOfficers = async () => {
    try {
      setLoading(true);

      const result = await getOfficers({
        page: 1,
        limit: 100,
      });

      console.log("===== PHOTO DEBUG API =====");
      console.log(result.data);
      console.log("===== PHOTO DEBUG PHOTOGRAPHS =====");
      console.log(result.data.map((item) => ({
        name: item.fullName,
        photograph: item.photograph,
      })));


      setOfficerList(
        result.data.map(convertApiOfficer)
      );
    } catch (error) {
      console.error("Load officers:", error);
      setOfficerList([]);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to load officers from MongoDB."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOfficers();
  }, []);

  const filteredOfficers = useMemo(() => {
    const query = search.toLowerCase().trim();

    return officerList.filter((officer) => {
      const matchesSearch =
        !query ||
        officer.name.toLowerCase().includes(query) ||
        officer.id.toLowerCase().includes(query) ||
        officer.beltNumber.toLowerCase().includes(query) ||
        officer.mobile.toLowerCase().includes(query) ||
        officer.district.toLowerCase().includes(query) ||
        officer.department.toLowerCase().includes(query) ||
        officer.rank.toLowerCase().includes(query);

      const matchesRank =
        rank === "All Ranks" ||
        officer.rank === rank;

      const matchesDepartment =
        department === "All Departments" ||
        officer.department === department;

      const matchesDistrict =
        district === "All Districts" ||
        officer.district === district;

      const matchesStatus =
        status === "All Status" ||
        officer.status === status;

      return (
        matchesSearch &&
        matchesRank &&
        matchesDepartment &&
        matchesDistrict &&
        matchesStatus
      );
    });
  }, [
    officerList,
    search,
    rank,
    department,
    district,
    status,
  ]);

  const activeCount = officerList.filter(
    (item) => item.status === "Active"
  ).length;

  const suspendedCount = officerList.filter(
    (item) => item.status === "Suspended"
  ).length;

  const retiredCount = officerList.filter(
    (item) => item.status === "Retired"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setRank("All Ranks");
    setDepartment("All Departments");
    setDistrict("All Districts");
    setStatus("All Status");
  };

  const handleSaveOfficer = async (
    officer: any
  ) => {
    try {
      setSaving(true);

      const created = await createOfficer({
        fullName: officer.fullName,
        employeeId: officer.employeeId,
        beltNumber: officer.beltNumber,
        rank: officer.rank,
        designation: officer.designation,
        department: officer.department,
        headquarters: officer.headquarters,
        district: officer.district,
        state: officer.state,
        mobileNumber: officer.mobile,
        officialEmail: officer.officialEmail,
        dateOfBirth: officer.dateOfBirth,
        dateOfJoining: officer.dateOfJoining,
        currentPosting: officer.currentPosting,
        previousPosting: officer.previousPosting,
        serviceStatus: officer.serviceStatus,
        bloodGroup: officer.bloodGroup,
        emergencyContact: officer.emergencyContact,
        address: officer.address,
        gender: officer.gender,
        promotionHistory: [],
        documents: [],
      });

      setOfficerList((previous) => [
        convertApiOfficer(created),
        ...previous.filter(
          (item) => !item.mongoId
        ),
      ]);

      setShowAddOfficer(false);

      alert(
        "Officer added successfully and saved to MongoDB."
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save officer."
      );
    } finally {
      setSaving(false);
    }
  };

  const loadSelectedOfficer = async (
    id: string
  ) => {
    const row = officerList.find(
      (item) => item.id === id
    );

    if (!row?.mongoId) {
      alert(
        "This is a demo record and is not stored in MongoDB."
      );
      return null;
    }

    try {
      setSaving(true);

      const officer =
        await getOfficerById(row.mongoId);

      setSelectedOfficer(officer);

      return officer;
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to load officer."
      );

      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleViewOfficer = async (
    id: string
  ) => {
    const officer =
      await loadSelectedOfficer(id);

    if (officer) {
      setShowViewOfficer(true);
    }
  };

  const handleEditOfficer = async (
    id: string
  ) => {
    const officer =
      await loadSelectedOfficer(id);

    if (officer) {
      setShowEditOfficer(true);
    }
  };

  const handleUpdateOfficer = async (
    data: Partial<ApiOfficer>
  ) => {
    if (!selectedOfficer?._id) return;

    try {
      setSaving(true);

      const updated = await updateOfficer(
        selectedOfficer._id,
        data
      );

      setOfficerList((previous) =>
        previous.map((item) =>
          item.mongoId === updated._id
            ? convertApiOfficer(updated)
            : item
        )
      );

      setSelectedOfficer(updated);
      setShowEditOfficer(false);

      alert("Officer updated successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to update officer."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    id: string
  ) => {
    const officer = officerList.find(
      (item) => item.id === id
    );

    if (!officer) return;

    if (!officer.mongoId) {
      alert(
        "This is a demo record and cannot be deleted from MongoDB."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete officer "${officer.name}"?`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      await deleteOfficer(
        officer.mongoId
      );

      setOfficerList((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );

      alert("Officer deleted successfully.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete officer."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm text-slate-500">
            Police Headquarters
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">
            Officer Database
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Search and manage all police officer records.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={() =>
            setShowAddOfficer(true)
          }
          className="flex w-fit items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#102A43] disabled:opacity-50"
        >
          <UserPlus size={18} />
          Add Officer
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Officers"
          value={officerList.length.toLocaleString()}
        />

        <SummaryCard
          title="Active"
          value={activeCount.toLocaleString()}
          valueClass="text-green-700"
        />

        <SummaryCard
          title="Suspended"
          value={suspendedCount.toLocaleString()}
          valueClass="text-red-600"
        />

        <SummaryCard
          title="Retired"
          value={retiredCount.toLocaleString()}
          valueClass="text-slate-500"
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="flex flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
            <Search
              size={19}
              className="text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, ID, belt number, mobile, district, department or rank..."
              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                <X
                  size={17}
                  className="text-slate-400"
                />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(!showFilters)
            }
            className={`flex items-center justify-center gap-2 rounded-lg border px-5 py-3 text-sm font-semibold ${
              showFilters
                ? "border-[#0B1F3A] bg-[#0B1F3A] text-white"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            <Filter size={18} />
            Filters

            <ChevronDown
              size={16}
              className={
                showFilters
                  ? "rotate-180"
                  : ""
              }
            />
          </button>
        </div>

        {showFilters && (
          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
            <FilterSelect
              label="Rank"
              value={rank}
              options={ranks}
              onChange={setRank}
            />

            <FilterSelect
              label="Department"
              value={department}
              options={departments}
              onChange={setDepartment}
            />

            <FilterSelect
              label="District"
              value={district}
              options={districts}
              onChange={setDistrict}
            />

            <FilterSelect
              label="Service Status"
              value={status}
              options={statuses}
              onChange={setStatus}
            />

            <button
              type="button"
              onClick={clearFilters}
              className="text-left text-sm font-semibold text-[#0B1F3A]"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#0B1F3A]">
            Officer Records
          </p>

          <p className="text-xs text-slate-500">
            {loading
              ? "Loading records..."
              : `Showing ${filteredOfficers.length} matching records`}
          </p>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead className="bg-[#F8FAFC]">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-4">
                  Officer
                </th>
                <th className="px-5 py-4">
                  Rank
                </th>
                <th className="px-5 py-4">
                  Department
                </th>
                <th className="px-5 py-4">
                  Headquarters
                </th>
                <th className="px-5 py-4">
                  District
                </th>
                <th className="px-5 py-4">
                  Status
                </th>
                <th className="px-5 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-sm text-slate-500"
                  >
                    Loading officers...
                  </td>
                </tr>
              ) : filteredOfficers.length ? (
                filteredOfficers.map(
                  (officer) => (
                    <tr
                      key={
                        officer.mongoId ||
                        officer.id
                      }
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0B1F3A] font-bold text-[#C9A227]">
                            {officer.photograph ? (
                              <img
                                src={`http://127.0.0.1:5000${officer.photograph.startsWith("/") ? "" : "/"}${officer.photograph}`}
                                alt={officer.name}
                                className="absolute inset-0 h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                  const fallback = event.currentTarget.parentElement?.querySelector("[data-card-photo-fallback]") as HTMLElement | null;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <span
                              data-card-photo-fallback
                              className={`absolute inset-0 items-center justify-center ${officer.photograph ? "hidden" : "flex"}`}
                            >
                              {getInitials(officer.name)}
                            </span>
                          </div>

                          <div>
                            <p className="font-semibold text-[#0B1F3A]">
                              {officer.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {officer.id}
                            </p>

                            <p className="text-xs text-slate-400">
                              Belt:{" "}
                              {officer.beltNumber}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {officer.rank}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {officer.department}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {officer.headquarters}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {officer.district}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={officer.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            title="View Officer"
                            onClick={() =>
                              void handleViewOfficer(
                                officer.id
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            title="Edit Officer"
                            onClick={() =>
                              void handleEditOfficer(
                                officer.id
                              )
                            }
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            title="Delete Officer"
                            onClick={() =>
                              void handleDelete(
                                officer.id
                              )
                            }
                            className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center"
                  >
                    <Search
                      size={35}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-semibold text-slate-600">
                      No officers found
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-3 text-sm font-semibold text-[#0B1F3A]"
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 p-4">
          <p className="text-xs text-slate-500">
            {filteredOfficers.length} records
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled
              className="rounded-lg border p-2 text-slate-300"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="rounded-lg bg-[#0B1F3A] px-3 py-2 text-xs text-white">
              1
            </span>

            <button
              type="button"
              disabled
              className="rounded-lg border p-2 text-slate-300"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {showAddOfficer && (
        <AddOfficerModal
          onClose={() =>
            setShowAddOfficer(false)
          }
          onSave={handleSaveOfficer}
        />
      )}

      {showEditOfficer &&
        selectedOfficer && (
          <EditOfficerModal
            officer={selectedOfficer}
            onClose={() =>
              setShowEditOfficer(false)
            }
            onSave={handleUpdateOfficer}
          onUploaded={(updatedOfficer) => {
            setSelectedOfficer(updatedOfficer);

            setOfficerList((previous) =>
              previous.map((item) =>
                item.mongoId === updatedOfficer._id
                  ? convertApiOfficer(updatedOfficer)
                  : item
              )
            );
          }}

          />
        )}

      {showViewOfficer &&
        selectedOfficer && (
          <ViewOfficerModal
            officer={selectedOfficer}
            onClose={() =>
              setShowViewOfficer(false)
            }
          />
        )}
    </div>
  );
}

function SummaryCard({
  title,
  value,
  valueClass = "text-[#0B1F3A]",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">
        {title}
      </p>

      <h2
        className={`mt-2 text-2xl font-bold ${valueClass}`}
      >
        {value}
      </h2>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: OfficerStatus;
}) {
  const classes = {
    Active: "bg-green-50 text-green-700",
    Suspended: "bg-red-50 text-red-700",
    Retired: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ViewOfficerModal({
  officer,
  onClose,
}: {
  officer: ApiOfficer;
  onClose: () => void;
}) {
  const API_ORIGIN =
    import.meta.env.VITE_API_URL
      ? String(import.meta.env.VITE_API_URL).replace(
          /\/api\/?$/,
          ""
        )
      : "http://127.0.0.1:5000";

  const photoUrl = officer.photograph ? `${API_ORIGIN}${officer.photograph.startsWith("/") ? "" : "/"}${officer.photograph}` : "";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
              Police Headquarters
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
              Officer Profile
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <div className="overflow-y-auto p-6">

          {/* PROFILE HEADER */}

          <div className="rounded-xl bg-[#0B1F3A] p-6 text-white">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#C9A227] bg-white text-2xl font-bold text-[#0B1F3A]">
  {photoUrl ? (
  <img
    key={photoUrl}
    src={photoUrl}
    alt={officer.fullName}
    className="absolute inset-0 block h-full w-full object-cover"
    onLoad={() => console.log("PROFILE PHOTO LOADED:", photoUrl)}
    onError={(e) => {
      console.error("PROFILE PHOTO FAILED:", photoUrl);
      e.currentTarget.style.display = "none";
      const fallback =
        e.currentTarget.parentElement?.querySelector(
          "[data-photo-fallback]"
        ) as HTMLElement | null;

      if (fallback) {
        fallback.style.display = "flex";
      }
    }}
  />
) : null}

  <span
    data-photo-fallback
    className={`absolute inset-0 items-center justify-center ${
      photoUrl ? "hidden" : "flex"
    }`}
  >
    {getInitials(officer.fullName)}
  </span>
</div>

<div>
  <h3 className="text-2xl font-bold">
                  {officer.fullName}
                </h3>

                <p className="text-sm text-slate-300">
                  {officer.rank} • {officer.department}
                </p>

                <p className="mt-2 text-xs text-[#C9A227]">
                  Employee ID: {officer.employeeId}
                </p>

                {officer.beltNumber && (
                  <p className="mt-1 text-xs text-slate-300">
                    Belt Number: {officer.beltNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PERSONAL / SERVICE INFORMATION */}

          <div className="mt-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Officer Information
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ProfileField
                label="Belt Number"
                value={officer.beltNumber}
              />

              <ProfileField
                label="Rank"
                value={officer.rank}
              />

              <ProfileField
                label="Designation"
                value={officer.designation}
              />

              <ProfileField
                label="Department"
                value={officer.department}
              />

              <ProfileField
                label="Headquarters"
                value={officer.headquarters}
              />

              <ProfileField
                label="District"
                value={officer.district}
              />

              <ProfileField
                label="State"
                value={officer.state}
              />

              <ProfileField
                label="Gender"
                value={officer.gender}
              />

              <ProfileField
                label="Mobile"
                value={officer.mobileNumber}
              />

              <ProfileField
                label="Official Email"
                value={officer.officialEmail}
              />

              <ProfileField
                label="Blood Group"
                value={officer.bloodGroup}
              />

              <ProfileField
                label="Date of Birth"
                value={formatDate(officer.dateOfBirth)}
              />

              <ProfileField
                label="Date of Joining"
                value={formatDate(officer.dateOfJoining)}
              />

              <ProfileField
                label="Service Status"
                value={officer.serviceStatus}
              />

              <ProfileField
                label="Current Posting"
                value={officer.currentPosting}
              />

              <ProfileField
                label="Previous Posting"
                value={officer.previousPosting}
              />

              <ProfileField
                label="Emergency Contact"
                value={officer.emergencyContact}
              />
            </div>
          </div>

          {/* ADDRESS */}

          <div className="mt-5 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Address
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {officer.address || "Not available"}
            </p>
          </div>

          {/* PROMOTION HISTORY */}

          <div className="mt-5 rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Promotion History
            </p>

            {officer.promotionHistory?.length ? (
              <div className="mt-4 space-y-3">
                {officer.promotionHistory.map(
                  (promotion, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <div className="flex flex-col justify-between gap-2 sm:flex-row">
                        <p className="font-semibold text-[#0B1F3A]">
                          {promotion.rank}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDate(promotion.date)}
                        </p>
                      </div>

                      {promotion.orderNumber && (
                        <p className="mt-2 text-xs text-slate-500">
                          Order Number:{" "}
                          {promotion.orderNumber}
                        </p>
                      )}

                      {promotion.remarks && (
                        <p className="mt-2 text-sm text-slate-600">
                          Remarks: {promotion.remarks}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No promotion history available.
              </p>
            )}
          </div>

          {/* DOCUMENTS */}

          <div className="mt-5 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Officer Documents
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Uploaded service documents and records
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {officer.documents?.length || 0} Documents
              </span>
            </div>

            {officer.documents?.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {officer.documents.map(
                  (document, index) => (
                    <a
                      key={`${document}-${index}`}
                      href={`${API_ORIGIN}${document}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-[#C9A227] hover:bg-slate-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A] text-xs font-bold text-[#C9A227]">
                          PDF
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#0B1F3A]">
                            Document {index + 1}
                          </p>

                          <p className="text-xs text-slate-400">
                            Open document
                          </p>
                        </div>
                      </div>

                      <span className="ml-3 text-xs font-semibold text-[#0B1F3A]">
                        Open →
                      </span>
                    </a>
                  )
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-slate-50 p-5 text-center">
                <p className="text-sm text-slate-500">
                  No documents uploaded.
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Use Edit Officer to upload documents.
                </p>
              </div>
            )}
          </div>

          {/* FOOTER */}

          <div className="mt-6 flex justify-end border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102A43]"
            >
              Close Profile
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}


function ProfileField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value || "Not available"}
      </p>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}










