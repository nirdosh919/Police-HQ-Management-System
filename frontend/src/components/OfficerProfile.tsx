interface OfficerProfileProps {
  officer: any | null;
  onClose: () => void;
}

export default function OfficerProfile({ officer, onClose }: OfficerProfileProps) {
  if (!officer) return null;

  const fields = [
    ["Employee ID", officer.employeeId],
    ["Rank", officer.rank],
    ["Designation", officer.designation],
    ["Department", officer.department],
    ["Headquarters", officer.headquarters],
    ["District", officer.district],
    ["State", officer.state],
    ["Mobile", officer.mobileNumber],
    ["Official Email", officer.officialEmail],
    ["Current Posting", officer.currentPosting],
    ["Previous Posting", officer.previousPosting],
    ["Gender", officer.gender],
    ["Blood Group", officer.bloodGroup],
    ["Service Status", officer.serviceStatus],
  ];

  const promotions = Array.isArray(officer.promotionHistory)
    ? officer.promotionHistory
    : [];

  const transfers = Array.isArray(officer.transferHistory)
    ? officer.transferHistory
    : [];

  const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000`;

  const uploadDocuments = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    try {
      const token = localStorage.getItem("phq_auth_token");
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("documents", file);
      });

      const response = await fetch(
        `${API_BASE}/api/officers/${officer._id}/files`,
        {
          method: "POST",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Document upload failed");
      }

      window.location.reload();
    } catch (error) {
      console.error("Document upload error:", error);
      alert("Document upload failed");
    }
  };

  const deleteDocument = async (index: number) => {
    if (!window.confirm("Delete this document?")) return;

    try {
      const token = localStorage.getItem("phq_auth_token");

      const response = await fetch(
        `${API_BASE}/api/officers/${officer._id}/documents/${index}`,
        {
          method: "DELETE",
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Document deletion failed");
      }

      window.location.reload();
    } catch (error) {
      console.error("Document delete error:", error);
      alert("Document deletion failed");
    }
  };


  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Officer Profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Complete officer service information
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-500 hover:bg-slate-100"
          >
            ×
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">

          {/* Officer Header */}
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-slate-50 p-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {officer.photograph ? (
                <img
                  src={officer.photograph}
                  alt="Officer"
                  className="h-full w-full object-cover"
                />
              ) : (
                (officer.fullName || "O").charAt(0).toUpperCase()
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {officer.fullName || "-"}
              </h3>

              <p className="text-sm text-slate-500">
                {officer.rank || "-"} · {officer.employeeId || "-"}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-800">
              Basic Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fields.map(([label, value]) => (
                <div key={label} className="rounded-lg border p-4">
                  <p className="text-xs font-medium text-slate-500">
                    {label}
                  </p>

                  <p className="mt-1 break-words font-medium text-slate-800">
                    {value || "-"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg border p-4">
              <p className="text-xs font-medium text-slate-500">
                Address
              </p>

              <p className="mt-1 text-slate-800">
                {officer.address || "-"}
              </p>
            </div>
          </div>

          {/* Promotion History */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Promotion History
              </h3>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {promotions.length} Record{promotions.length !== 1 ? "s" : ""}
              </span>
            </div>

            {promotions.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No promotion history available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Promotion records will appear here when available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {promotions.map((promotion: any, index: number) => (
                  <div
                    key={promotion._id || index}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {promotion.rank || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {promotion.date
                            ? new Date(promotion.date).toLocaleDateString()
                            : "Date not available"}
                        </p>
                      </div>

                      {promotion.orderNumber && (
                        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Order: {promotion.orderNumber}
                        </span>
                      )}
                    </div>

                    {promotion.remarks && (
                      <p className="mt-3 border-t pt-3 text-sm text-slate-600">
                        {promotion.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-800">
                  Documents
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {Array.isArray(officer.documents)
                    ? officer.documents.length
                    : 0}{" "}
                  Document
                  {Array.isArray(officer.documents) &&
                  officer.documents.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>

              <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                Upload Documents
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    uploadDocuments(event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>
            </div>

            {!Array.isArray(officer.documents) ||
            officer.documents.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No documents available
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Click "Upload Documents" to add officer documents.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {officer.documents.map(
                  (document: string, index: number) => {
                    const documentUrl =
                      /^https?:\/\//i.test(document)
                        ? document
                        : `${API_BASE}${document}`;

                    return (
                      <div
                        key={`${document}-${index}`}
                        className="flex items-center justify-between rounded-xl border bg-white p-4"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-500">
                            Document {index + 1}
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-800">
                            {document}
                          </p>
                        </div>

                        <div className="ml-3 flex shrink-0 gap-2">
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            View
                          </a>

                          <button
                            type="button"
                            onClick={() => deleteDocument(index)}
                            className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* Transfer History */}
          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">
                Transfer History
              </h3>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {transfers.length} Record{transfers.length !== 1 ? "s" : ""}
              </span>
            </div>

            {transfers.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-600">
                  No transfer history available
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Transfer records will appear here when available.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {transfers.map((transfer: any, index: number) => (
                  <div
                    key={transfer._id || index}
                    className="rounded-xl border p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">
                          {transfer.fromPosting || "-"} → {transfer.toPosting || "-"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {transfer.date
                            ? new Date(transfer.date).toLocaleDateString()
                            : "Date not available"}
                        </p>
                      </div>

                      {transfer.orderNumber && (
                        <span className="rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          Order: {transfer.orderNumber}
                        </span>
                      )}
                    </div>

                    {transfer.remarks && (
                      <p className="mt-3 border-t pt-3 text-sm text-slate-600">
                        {transfer.remarks}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        <div className="flex justify-end border-t bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}


