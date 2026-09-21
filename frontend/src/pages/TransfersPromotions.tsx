import { useEffect, useMemo, useState } from "react";
import {
  ArrowRightLeft,
  Award,
  RefreshCw,
  Search,
  Save,
  History,
} from "lucide-react";

type Transfer = {
  fromPosting: string;
  toPosting: string;
  date: string;
  orderNumber?: string;
  remarks?: string;
};

type Promotion = {
  rank: string;
  date: string;
  orderNumber?: string;
  remarks?: string;
};

type Officer = {
  _id?: string;
  fullName: string;
  employeeId: string;
  beltNumber?: string;
  rank: string;
  department: string;
  district?: string;
  currentPosting?: string;
  previousPosting?: string;
  promotionHistory?: Promotion[];
  transferHistory?: Transfer[];
  serviceStatus: "Active" | "Suspended" | "Retired";
};

type OfficersResponse = {
  success?: boolean;
  data?: Officer[];
};

const API =
  import.meta.env.VITE_API_URL ||
  "https://police-hq-management-backend.onrender.com/api";
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("phq_auth_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export default function TransfersPromotions() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const [newPosting, setNewPosting] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [transferOrderNumber, setTransferOrderNumber] = useState("");
  const [transferRemarks, setTransferRemarks] = useState("");

  const [promotionRank, setPromotionRank] = useState("");
  const [promotionDate, setPromotionDate] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingPosting, setSavingPosting] = useState(false);
  const [savingPromotion, setSavingPromotion] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadOfficers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/officers?page=1&limit=1000`,
        {
          headers: getAuthHeaders(),
        }
      );

      const result: OfficersResponse =
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
        "TRANSFER/PROMOTION FETCH ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load officers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOfficers();
  }, []);

  const filteredOfficers = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return officers;

    return officers.filter((officer) =>
      [
        officer.fullName,
        officer.employeeId,
        officer.rank,
        officer.department,
        officer.district || "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [officers, search]);

  const selectedOfficer = officers.find(
    (officer) => officer._id === selectedId
  );

  useEffect(() => {
    if (selectedOfficer) {
      setNewPosting(
        selectedOfficer.currentPosting || ""
      );

      setPromotionRank(selectedOfficer.rank || "");
    }
  }, [selectedOfficer]);

  const savePosting = async () => {
    if (!selectedOfficer?._id) {
      setError("Please select an officer first.");
      return;
    }

    if (!newPosting.trim()) {
      setError("Please enter the new posting.");
      return;
    }

    if (!transferDate) {
      setError("Transfer date is required.");
      return;
    }

    try {
      setSavingPosting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/officers/${selectedOfficer._id}/transfers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            toPosting: newPosting.trim(),
            date: transferDate,
            orderNumber: transferOrderNumber.trim(),
            remarks: transferRemarks.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to record transfer"
        );
      }

      setMessage(
        `Transfer recorded successfully for ${selectedOfficer.fullName}.`
      );

      setTransferDate("");
      setTransferOrderNumber("");
      setTransferRemarks("");

      await loadOfficers();
    } catch (err) {
      console.error(
        "TRANSFER ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to record transfer"
      );
    } finally {
      setSavingPosting(false);
    }
  };
  const addPromotion = async () => {
    if (!selectedOfficer?._id) {
      setError("Please select an officer first.");
      return;
    }

    if (!promotionRank.trim()) {
      setError("Promotion rank is required.");
      return;
    }

    if (!promotionDate) {
      setError("Promotion date is required.");
      return;
    }

    try {
      setSavingPromotion(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API}/officers/${selectedOfficer._id}/promotions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            rank: promotionRank.trim(),
            date: promotionDate,
            orderNumber:
              orderNumber.trim(),
            remarks: remarks.trim(),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Failed to add promotion"
        );
      }

      setMessage(
        `Promotion added successfully for ${selectedOfficer.fullName}.`
      );

      setPromotionDate("");
      setOrderNumber("");
      setRemarks("");

      await loadOfficers();
    } catch (err) {
      console.error(
        "PROMOTION ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to add promotion"
      );
    } finally {
      setSavingPromotion(false);
    }
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
            Transfers & Promotions
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage officer postings and service progression.
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
          Refresh
        </button>
      </div>

      {/* MESSAGES */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
        {/* OFFICER LIST */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Select Officer
            </label>

            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-3 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search officer..."
                className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          <div className="max-h-[600px] space-y-2 overflow-y-auto">
            {loading ? (
              <p className="p-4 text-sm text-slate-400">
                Loading officers...
              </p>
            ) : filteredOfficers.length ? (
              filteredOfficers.map(
                (officer) => (
                  <button
                    type="button"
                    key={
                      officer._id ||
                      officer.employeeId
                    }
                    onClick={() =>
                      setSelectedId(
                        officer._id || ""
                      )
                    }
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedId ===
                      officer._id
                        ? "border-[#0B1F3A] bg-[#0B1F3A] text-white"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-semibold">
                      {officer.fullName}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        selectedId ===
                        officer._id
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {officer.employeeId}
                      {" • "}
                      {officer.rank}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        selectedId ===
                        officer._id
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {officer.department}
                    </p>
                  </button>
                )
              )
            ) : (
              <p className="p-4 text-sm text-slate-400">
                No officers found.
              </p>
            )}
          </div>
        </section>

        {/* MANAGEMENT */}
        <section>
          {!selectedOfficer ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
              <ArrowRightLeft
                size={42}
                className="text-[#C9A227]"
              />

              <h2 className="mt-4 text-xl font-bold text-[#0B1F3A]">
                Select an Officer
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Select an officer from the left panel to manage transfers, postings and promotions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* OFFICER SUMMARY */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
                      Selected Officer
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
                      {selectedOfficer.fullName}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedOfficer.employeeId}
                      {" • "}
                      {selectedOfficer.rank}
                      {" • "}
                      {selectedOfficer.department}
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                    {selectedOfficer.serviceStatus}
                  </span>
                </div>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                {/* TRANSFER */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
                      <ArrowRightLeft size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[#0B1F3A]">
                        Transfer / Posting
                      </h2>

                      <p className="text-xs text-slate-500">
                        Update officer posting
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Previous Posting
                      </label>

                      <input
                        readOnly
                        value={
                          selectedOfficer.currentPosting ||
                          selectedOfficer.previousPosting ||
                          "Not Assigned"
                        }
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        New Current Posting
                      </label>

                      <input
                        value={newPosting}
                        onChange={(event) =>
                          setNewPosting(
                            event.target.value
                          )
                        }
                        placeholder="Example: Kanpur Nagar Police Line"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void savePosting()
                      }
                      disabled={
                        savingPosting
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-50"
                    >
                      <Save size={17} />

                      {savingPosting
                        ? "Saving..."
                        : "Save Posting"}
                    </button>
                  </div>
                </div>

                {/* PROMOTION */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C9A227] text-[#0B1F3A]">
                      <Award size={20} />
                    </div>

                    <div>
                      <h2 className="font-bold text-[#0B1F3A]">
                        Promotion
                      </h2>

                      <p className="text-xs text-slate-500">
                        Add service promotion
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Promoted Rank
                      </label>

                      <input
                        value={
                          promotionRank
                        }
                        onChange={(event) =>
                          setPromotionRank(
                            event.target.value
                          )
                        }
                        placeholder="Example: Inspector"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Promotion Date
                      </label>

                      <input
                        type="date"
                        value={
                          promotionDate
                        }
                        onChange={(event) =>
                          setPromotionDate(
                            event.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-500">
                        Order Number
                      </label>

                      <input
                        value={
                          orderNumber
                        }
                        onChange={(event) =>
                          setOrderNumber(
                            event.target.value
                          )
                        }
                        placeholder="Promotion order number"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <div>
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
                        rows={3}
                        placeholder="Promotion remarks"
                        className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        void addPromotion()
                      }
                      disabled={
                        savingPromotion
                      }
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-4 py-3 text-sm font-semibold text-[#0B1F3A] hover:opacity-90 disabled:opacity-50"
                    >
                      <Award size={17} />

                      {savingPromotion
                        ? "Saving..."
                        : "Add Promotion"}
                    </button>
                  </div>
                </div>
              </div>

              {/* POSTING HISTORY */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <History
                    size={21}
                    className="text-[#C9A227]"
                  />

                  <div>
                    <h2 className="font-bold text-[#0B1F3A]">
                      Posting History
                    </h2>

                    <p className="text-xs text-slate-500">
                      Current and previous posting information
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Current Posting
                    </p>

                    <p className="mt-2 font-semibold text-[#0B1F3A]">
                      {selectedOfficer.currentPosting ||
                        "Not Assigned"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-400">
                      Previous Posting
                    </p>

                    <p className="mt-2 font-semibold text-[#0B1F3A]">
                      {selectedOfficer.previousPosting ||
                        "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>

              {/* TRANSFER HISTORY */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <History
                    size={21}
                    className="text-[#C9A227]"
                  />

                  <div>
                    <h2 className="font-bold text-[#0B1F3A]">
                      Transfer History
                    </h2>

                    <p className="text-xs text-slate-500">
                      Complete officer posting movement history
                    </p>
                  </div>
                </div>

                {selectedOfficer.transferHistory?.length ? (
                  <div className="mt-5 space-y-3">
                    {[...selectedOfficer.transferHistory]
                      .reverse()
                      .map((transfer, index) => (
                        <div
                          key={`${transfer.date}-${transfer.toPosting}-${index}`}
                          className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                        >
                          <div className="flex flex-col justify-between gap-2 sm:flex-row">
                            <div>
                              <p className="font-semibold text-[#0B1F3A]">
                                {transfer.fromPosting || "Initial Posting"}
                                {" → "}
                                {transfer.toPosting}
                              </p>

                              {transfer.orderNumber && (
                                <p className="mt-2 text-xs text-slate-500">
                                  Order: {transfer.orderNumber}
                                </p>
                              )}

                              {transfer.remarks && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {transfer.remarks}
                                </p>
                              )}
                            </div>

                            <p className="text-xs text-slate-500">
                              {transfer.date
                                ? new Date(
                                    transfer.date
                                  ).toLocaleDateString("en-IN")
                                : "Date unavailable"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">
                    No transfer history recorded.
                  </div>
                )}
              </div>
              {/* PROMOTION HISTORY */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <Award
                    size={21}
                    className="text-[#C9A227]"
                  />

                  <div>
                    <h2 className="font-bold text-[#0B1F3A]">
                      Promotion History
                    </h2>

                    <p className="text-xs text-slate-500">
                      Recorded service promotions
                    </p>
                  </div>
                </div>

                {selectedOfficer.promotionHistory?.length ? (
                  <div className="mt-5 space-y-3">
                    {[
                      ...selectedOfficer.promotionHistory,
                    ]
                      .reverse()
                      .map(
                        (
                          promotion,
                          index
                        ) => (
                          <div
                            key={`${promotion.rank}-${promotion.date}-${index}`}
                            className="rounded-lg border border-slate-100 bg-slate-50 p-4"
                          >
                            <div className="flex flex-col justify-between gap-2 sm:flex-row">
                              <p className="font-semibold text-[#0B1F3A]">
                                {promotion.rank}
                              </p>

                              <p className="text-xs text-slate-500">
                                {promotion.date
                                  ? new Date(
                                      promotion.date
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "Date unavailable"}
                              </p>
                            </div>

                            {promotion.orderNumber && (
                              <p className="mt-2 text-xs text-slate-500">
                                Order:{" "}
                                {
                                  promotion.orderNumber
                                }
                              </p>
                            )}

                            {promotion.remarks && (
                              <p className="mt-1 text-xs text-slate-500">
                                {
                                  promotion.remarks
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-400">
                    No promotion history recorded.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}



