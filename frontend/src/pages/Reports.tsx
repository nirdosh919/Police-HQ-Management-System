import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  Users,
  Filter,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

type Officer = {
  _id?: string;
  fullName: string;
  employeeId: string;
  beltNumber?: string;
  rank: string;
  designation?: string;
  department: string;
  headquarters?: string;
  district?: string;
  state?: string;
  mobileNumber?: string;
  gender?: string;
  serviceStatus: "Active" | "Suspended" | "Retired";
  currentPosting?: string;
  previousPosting?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ApiResponse = {
  success?: boolean;
  data?: Officer[];
};

const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function safeText(value?: string) {
  return value?.trim() || "Not Assigned";
}

const authFetch = async (
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("phq_auth_token");
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return window.fetch(input, {
    ...init,
    headers,
  });
};
export default function Reports() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [department, setDepartment] = useState("All Departments");
  const [district, setDistrict] = useState("All Districts");
  const [status, setStatus] = useState("All Status");

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await authFetch(
        `${API}/officers?page=1&limit=1000`
      );

      const result: ApiResponse =
        await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          "Unable to load officer records"
        );
      }

      setOfficers(
        Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(
        "REPORT FETCH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load officer records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOfficers();
  }, []);

  const departments = useMemo(() => {
    return [
      "All Departments",
      ...Array.from(
        new Set(
          officers
            .map((officer) =>
              safeText(officer.department)
            )
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [officers]);

  const districts = useMemo(() => {
    return [
      "All Districts",
      ...Array.from(
        new Set(
          officers
            .map((officer) =>
              safeText(officer.district)
            )
            .filter(Boolean)
        )
      ).sort(),
    ];
  }, [officers]);

  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const departmentMatch =
        department === "All Departments" ||
        safeText(officer.department) ===
          department;

      const districtMatch =
        district === "All Districts" ||
        safeText(officer.district) ===
          district;

      const statusMatch =
        status === "All Status" ||
        officer.serviceStatus === status;

      return (
        departmentMatch &&
        districtMatch &&
        statusMatch
      );
    });
  }, [
    officers,
    department,
    district,
    status,
  ]);

  const summary = useMemo(() => {
    const total = filteredOfficers.length;

    const active = filteredOfficers.filter(
      (officer) =>
        officer.serviceStatus === "Active"
    ).length;

    const suspended =
      filteredOfficers.filter(
        (officer) =>
          officer.serviceStatus ===
          "Suspended"
      ).length;

    const retired =
      filteredOfficers.filter(
        (officer) =>
          officer.serviceStatus === "Retired"
      ).length;

    return {
      total,
      active,
      suspended,
      retired,
    };
  }, [filteredOfficers]);

  const exportExcel = () => {
    if (!filteredOfficers.length) {
      return;
    }

    const rows = filteredOfficers.map(
      (officer) => ({
        "Full Name": officer.fullName,
        "Employee ID": officer.employeeId,
        "Belt Number":
          officer.beltNumber || "",
        Rank: officer.rank,
        Designation:
          officer.designation || "",
        Department:
          officer.department,
        Headquarters:
          officer.headquarters || "",
        District:
          officer.district || "",
        State:
          officer.state || "",
        Gender:
          officer.gender || "",
        Mobile:
          officer.mobileNumber || "",
        Status:
          officer.serviceStatus,
        "Current Posting":
          officer.currentPosting || "",
        "Previous Posting":
          officer.previousPosting || "",
        "Date Added":
          formatDate(officer.createdAt),
        "Last Updated":
          formatDate(officer.updatedAt),
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    worksheet["!cols"] = [
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 22 },
      { wch: 22 },
      { wch: 18 },
      { wch: 15 },
      { wch: 12 },
      { wch: 16 },
      { wch: 14 },
      { wch: 28 },
      { wch: 28 },
      { wch: 16 },
      { wch: 16 },
    ];

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Officer Report"
    );

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    XLSX.writeFile(
      workbook,
      `Police-HQ-Officer-Report-${date}.xlsx`
    );
  };

  const exportPDF = () => {
    if (!filteredOfficers.length) {
      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const drawHeader = () => {
      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(17);

      pdf.text(
        "POLICE HEADQUARTERS",
        14,
        15
      );

      pdf.setFontSize(11);

      pdf.text(
        "Officer Management Report",
        14,
        22
      );

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(8);

      pdf.text(
        `Generated: ${new Date().toLocaleString(
          "en-IN"
        )}`,
        14,
        28
      );

      pdf.text(
        `Filters: ${department} | ${district} | ${status}`,
        14,
        33
      );

      pdf.text(
        `Total: ${summary.total}   Active: ${summary.active}   Suspended: ${summary.suspended}   Retired: ${summary.retired}`,
        14,
        38
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(8);

      pdf.text("Officer", 14, 47);
      pdf.text("Employee ID", 66, 47);
      pdf.text("Rank", 103, 47);
      pdf.text("Department", 132, 47);
      pdf.text("District", 188, 47);
      pdf.text("Status", 225, 47);
      pdf.text("Posting", 251, 47);

      pdf.setFont(
        "helvetica",
        "normal"
      );
    };

    drawHeader();

    let y = 53;

    filteredOfficers.forEach(
      (officer) => {
        if (y > 190) {
          pdf.addPage();
          drawHeader();
          y = 53;
        }

        const name =
          officer.fullName.length > 25
            ? `${officer.fullName.slice(
                0,
                22
              )}...`
            : officer.fullName;

        const employeeId =
          officer.employeeId.length > 15
            ? officer.employeeId.slice(
                0,
                15
              )
            : officer.employeeId;

        const rank =
          officer.rank.length > 14
            ? officer.rank.slice(
                0,
                14
              )
            : officer.rank;

        const dept =
          safeText(
            officer.department
          ).length > 18
            ? safeText(
                officer.department
              ).slice(0, 18)
            : safeText(
                officer.department
              );

        const dist =
          safeText(
            officer.district
          ).length > 15
            ? safeText(
                officer.district
              ).slice(0, 15)
            : safeText(
                officer.district
              );

        const posting =
          safeText(
            officer.currentPosting
          ).length > 20
            ? safeText(
                officer.currentPosting
              ).slice(0, 20)
            : safeText(
                officer.currentPosting
              );

        pdf.text(
          name,
          14,
          y
        );

        pdf.text(
          employeeId,
          66,
          y
        );

        pdf.text(
          rank,
          103,
          y
        );

        pdf.text(
          dept,
          132,
          y
        );

        pdf.text(
          dist,
          188,
          y
        );

        pdf.text(
          officer.serviceStatus,
          225,
          y
        );

        pdf.text(
          posting,
          251,
          y
        );

        y += 6;
      }
    );

    const date = new Date()
      .toISOString()
      .slice(0, 10);

    pdf.save(
      `Police-HQ-Officer-Report-${date}.pdf`
    );
  };

  const resetFilters = () => {
    setDepartment("All Departments");
    setDistrict("All Districts");
    setStatus("All Status");
  };

  return (
    <div>
      {/* HEADER */}
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-500">
            Police Headquarters
          </p>

          <h1 className="mt-1 text-3xl font-bold text-[#0B1F3A]">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Generate and export officer management reports.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadOfficers()
          }
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />
          Refresh Data
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* FILTERS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter
              size={19}
              className="text-[#C9A227]"
            />

            <div>
              <h2 className="font-bold text-[#0B1F3A]">
                Report Filters
              </h2>

              <p className="text-xs text-slate-500">
                Filter the records before exporting.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-xs font-semibold text-[#0B1F3A] hover:underline"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Department
            </label>

            <select
              value={department}
              onChange={(event) =>
                setDepartment(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            >
              {departments.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              District
            </label>

            <select
              value={district}
              onChange={(event) =>
                setDistrict(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            >
              {districts.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-500">
              Service Status
            </label>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
            >
              <option value="All Status">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Suspended">
                Suspended
              </option>

              <option value="Retired">
                Retired
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [
            "Total Officers",
            summary.total,
          ],
          [
            "Active",
            summary.active,
          ],
          [
            "Suspended",
            summary.suspended,
          ],
          [
            "Retired",
            summary.retired,
          ],
        ].map(
          ([title, value]) => (
            <div
              key={String(title)}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-[#0B1F3A]">
                    {loading
                      ? "—"
                      : String(value)}
                  </p>
                </div>

                <Users
                  size={22}
                  className="text-[#C9A227]"
                />
              </div>
            </div>
          )
        )}
      </div>

      {/* EXPORT */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <button
          type="button"
          onClick={exportPDF}
          disabled={
            loading ||
            !filteredOfficers.length
          }
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50"
        >
          <div>
            <p className="font-bold text-[#0B1F3A]">
              Export PDF
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Generate a printable officer report.
            </p>

            <p className="mt-3 text-xs font-semibold text-[#C9A227]">
              {filteredOfficers.length} records
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
            <FileText size={24} />
          </div>
        </button>

        <button
          type="button"
          onClick={exportExcel}
          disabled={
            loading ||
            !filteredOfficers.length
          }
          className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50"
        >
          <div>
            <p className="font-bold text-[#0B1F3A]">
              Export Excel
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Generate a spreadsheet for further analysis.
            </p>

            <p className="mt-3 text-xs font-semibold text-[#C9A227]">
              {filteredOfficers.length} records
            </p>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
            <FileSpreadsheet size={24} />
          </div>
        </button>
      </div>

      {/* PREVIEW */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-[#0B1F3A]">
              Report Preview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing{" "}
              {filteredOfficers.length}{" "}
              filtered records
            </p>
          </div>

          <div className="flex gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">
              {department}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1">
              {district}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1">
              {status}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">
                  Officer
                </th>

                <th className="px-5 py-3">
                  Rank
                </th>

                <th className="px-5 py-3">
                  Department
                </th>

                <th className="px-5 py-3">
                  District
                </th>

                <th className="px-5 py-3">
                  Posting
                </th>

                <th className="px-5 py-3">
                  Status
                </th>

                <th className="px-5 py-3">
                  Updated
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    Loading report data...
                  </td>
                </tr>
              ) : filteredOfficers.length ? (
                filteredOfficers.map(
                  (officer) => (
                    <tr
                      key={
                        officer._id ||
                        officer.employeeId
                      }
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-[#0B1F3A]">
                          {
                            officer.fullName
                          }
                        </p>

                        <p className="text-xs text-slate-400">
                          {
                            officer.employeeId
                          }
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        {officer.rank}
                      </td>

                      <td className="px-5 py-4">
                        {
                          officer.department
                        }
                      </td>

                      <td className="px-5 py-4">
                        {safeText(
                          officer.district
                        )}
                      </td>

                      <td className="max-w-[220px] px-5 py-4">
                        <span className="line-clamp-2">
                          {safeText(
                            officer.currentPosting
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {
                            officer.serviceStatus
                          }
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(
                          officer.updatedAt ||
                            officer.createdAt
                        )}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center"
                  >
                    <FileText
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm font-semibold text-slate-500">
                      No records found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Change the filters and try again.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-center gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400">
        <Download size={13} />
        Police Headquarters Officer Management System
      </div>
    </div>
  );
}

