import { useEffect, useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import type {
  Officer,
  Promotion,
} from "../services/officerApi";

import {
  addOfficerPromotion,
  uploadOfficerFiles,
  deleteOfficerDocument,
} from "../services/officerApi";

type EditOfficerModalProps = {
  officer: Officer;
  onClose: () => void;
  onSave: (data: Partial<Officer>) => Promise<void>;
  onUploaded?: (officer: Officer) => void;
};

const API_ORIGIN =
  import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(
        /\/api\/?$/,
        ""
      )
    : "https://police-hq-management-backend.onrender.com";

export default function EditOfficerModal({
  officer,
  onClose,
  onSave,
  onUploaded,
}: EditOfficerModalProps) {
  const [form, setForm] = useState({
    fullName: "",
    employeeId: "",
    beltNumber: "",
    rank: "",
    designation: "",
    department: "",
    headquarters: "",
    district: "",
    state: "",
    mobileNumber: "",
    officialEmail: "",
    dateOfBirth: "",
    dateOfJoining: "",
    currentPosting: "",
    previousPosting: "",
    serviceStatus: "Active",
    bloodGroup: "",
    emergencyContact: "",
    address: "",
    gender: "",
  });

  const [saving, setSaving] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("phq_auth_token");
    fetch("https://police-hq-management-backend.onrender.com/api/departments", { headers: token ? { Authorization: "Bearer " + token } : {} })
      .then((r) => r.json())
      .then((result) => { if (result.success) setDepartments((result.data || []).map((d: any) => d.name)); })
      .catch((error) => console.error("Department loading error:", error));
  }, []);
  const [uploading, setUploading] = useState(false);

  const [photograph, setPhotograph] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const existingPhotoUrl = officer.photograph ? (officer.photograph.startsWith("http") ? officer.photograph : "https://police-hq-management-backend.onrender.com" + (officer.photograph.startsWith("/") ? "" : "/") + officer.photograph) : "";

  const [documents, setDocuments] =
    useState<File[]>([]);

  const [promotions, setPromotions] =
    useState<Promotion[]>(
      officer.promotionHistory || []
    );

  const [promotion, setPromotion] =
    useState({
      rank: "",
      date: "",
      orderNumber: "",
      remarks: "",
    });

  useEffect(() => {
    setForm({
      fullName: officer.fullName || "",
      employeeId: officer.employeeId || "",
      beltNumber: officer.beltNumber || "",
      rank: officer.rank || "",
      designation: officer.designation || "",
      department: officer.department || "",
      headquarters: officer.headquarters || "",
      district: officer.district || "",
      state: officer.state || "",
      mobileNumber: officer.mobileNumber || "",
      officialEmail: officer.officialEmail || "",
      dateOfBirth: officer.dateOfBirth
        ? officer.dateOfBirth.slice(0, 10)
        : "",
      dateOfJoining: officer.dateOfJoining
        ? officer.dateOfJoining.slice(0, 10)
        : "",
      currentPosting: officer.currentPosting || "",
      previousPosting: officer.previousPosting || "",
      serviceStatus:
        officer.serviceStatus || "Active",
      bloodGroup: officer.bloodGroup || "",
      emergencyContact:
        officer.emergencyContact || "",
      address: officer.address || "",
      gender: officer.gender || "",
    });

    setPromotions(
      officer.promotionHistory || []
    );
  }, [officer]);

  const update = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!officer._id) {
      alert("Officer ID is missing. Cannot save changes.");
      return;
    }

    try {
      setSaving(true);

      // 1. Upload photograph/documents FIRST.
      // This must happen before onSave because onSave closes the modal.
      if (photograph || documents.length > 0) {
        setUploading(true);

        const uploadResult = await uploadOfficerFiles(
          officer._id,
          photograph || undefined,
          documents
        );

        if (uploadResult.data) {
          onUploaded?.(uploadResult.data);
          setPromotions(
            uploadResult.data.promotionHistory || []
          );
        }

        setPhotograph(null);
        setDocuments([]);
        setPhotoPreview("");
        setUploading(false);
      }

      // 2. Save normal officer information AFTER upload.
      // Parent may close this modal here, so nothing important
      // should happen after this call.
      await onSave({
        ...form,
        serviceStatus:
          form.serviceStatus as Officer["serviceStatus"],
        gender: form.gender
          ? (form.gender as Officer["gender"])
          : undefined,
      });
    } catch (error) {
      console.error("SAVE OFFICER FAILED:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to save officer changes."
      );

      setUploading(false);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!officer._id) {
      alert(
        "Officer ID is missing. Cannot upload files."
      );
      return;
    }

    if (!photograph && documents.length === 0) {
      alert(
        "Please select a photograph or document first."
      );
      return;
    }

    try {
      setUploading(true);

      const result =
        await uploadOfficerFiles(
          officer._id,
          photograph || undefined,
          documents
        );

      if (result.data) {
      onUploaded?.(result.data);

        setPromotions(
          result.data.promotionHistory || []
        );
      }

      setPhotograph(null);
      setDocuments([]);

      alert(
        "Files uploaded successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to upload files."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleAddPromotion = async () => {
    if (!officer._id) {
      alert(
        "Officer ID is missing."
      );
      return;
    }

    if (
      !promotion.rank ||
      !promotion.date
    ) {
      alert(
        "Promotion rank and date are required."
      );
      return;
    }

    try {
      setUploading(true);

      const updated =
        await addOfficerPromotion(
          officer._id,
          promotion
        );

      setPromotions(
        updated.promotionHistory || []
      );

      setPromotion({
        rank: "",
        date: "",
        orderNumber: "",
        remarks: "",
      });

      alert(
        "Promotion history added successfully."
      );
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to add promotion."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (
  documentIndex: number
) => {
  if (!officer._id) {
    alert("Officer ID is missing.");
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete Document ${documentIndex + 1}?`
  );

  if (!confirmed) return;

  try {
    setUploading(true);

    const updated =
      await deleteOfficerDocument(
        officer._id,
        documentIndex
      );

    officer.documents =
      updated.documents || [];

    setPromotions(
      updated.promotionHistory || []
    );

    alert(
      "Document deleted successfully."
    );
  } catch (error) {
    console.error(error);

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete document."
    );
  } finally {
    setUploading(false);
  }
};
const removeDocument = (index: number) => {
    setDocuments((previous) =>
      previous.filter(
        (_file, fileIndex) =>
          fileIndex !== index
      )
    );
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
              Police Headquarters
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
              Edit Officer
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update officer service information,
              photograph, documents and promotions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={22} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6"
        >
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            <Field
              label="Full Name"
              value={form.fullName}
              onChange={(v) =>
                update("fullName", v)
              }
              required
            />

            <Field
              label="Employee ID"
              value={form.employeeId}
              onChange={(v) =>
                update("employeeId", v)
              }
              required
            />

            <Field
              label="Belt Number"
              value={form.beltNumber}
              onChange={(v) =>
                update("beltNumber", v)
              }
              required
            />

            <Field
              label="Rank"
              value={form.rank}
              onChange={(v) =>
                update("rank", v)
              }
              required
            />

            <Field
              label="Designation"
              value={form.designation}
              onChange={(v) =>
                update("designation", v)
              }
            />

            <Select label="Department" value={form.department} onChange={(v) => update("department", v)} options={departments} />

            <Field
              label="Headquarters"
              value={form.headquarters}
              onChange={(v) =>
                update("headquarters", v)
              }
            />

            <Field
              label="District"
              value={form.district}
              onChange={(v) =>
                update("district", v)
              }
            />

            <Field
              label="State"
              value={form.state}
              onChange={(v) =>
                update("state", v)
              }
            />

            <Field
              label="Mobile Number"
              value={form.mobileNumber}
              onChange={(v) =>
                update("mobileNumber", v)
              }
            />

            <Field
              label="Official Email"
              type="email"
              value={form.officialEmail}
              onChange={(v) =>
                update("officialEmail", v)
              }
            />

            <Field
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(v) =>
                update("dateOfBirth", v)
              }
            />

            <Field
              label="Date of Joining"
              type="date"
              value={form.dateOfJoining}
              onChange={(v) =>
                update("dateOfJoining", v)
              }
            />

            <Field
              label="Current Posting"
              value={form.currentPosting}
              onChange={(v) =>
                update("currentPosting", v)
              }
            />

            <Field
              label="Previous Posting"
              value={form.previousPosting}
              onChange={(v) =>
                update("previousPosting", v)
              }
            />

            <Select
              label="Service Status"
              value={form.serviceStatus}
              options={[
                "Active",
                "Suspended",
                "Retired",
              ]}
              onChange={(v) =>
                update(
                  "serviceStatus",
                  v
                )
              }
            />

            <Select
              label="Gender"
              value={form.gender}
              options={[
                "Male",
                "Female",
                "Other",
              ]}
              onChange={(v) =>
                update("gender", v)
              }
            />

            <Field
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(v) =>
                update("bloodGroup", v)
              }
            />

            <Field
              label="Emergency Contact"
              value={
                form.emergencyContact
              }
              onChange={(v) =>
                update(
                  "emergencyContact",
                  v
                )
              }
            />

            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Address
              </label>

              <textarea
                value={form.address}
                onChange={(e) =>
                  update(
                    "address",
                    e.target.value
                  )
                }
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
              />
            </div>
          </div>

          {/* PHOTOGRAPH */}

          <section className="mt-8 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <ImageIcon
                size={19}
                className="text-[#C9A227]"
              />

              <h3 className="font-bold text-[#0B1F3A]">
                Officer Photograph
              </h3>
            </div>

            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {(photoPreview || existingPhotoUrl) ? (
  <img
    key={photoPreview || existingPhotoUrl}
    src={photoPreview || existingPhotoUrl}
    alt={officer.fullName}
    className="h-full w-full object-cover"
    onError={(event) => {
      console.error("PHOTO PREVIEW FAILED:", photoPreview || existingPhotoUrl);
      event.currentTarget.style.display = "none";
    }}
  />
) : (
  <ImageIcon
    size={30}
    className="text-slate-300"
  />
)}
              </div>

              <div>
                <input
                  id="officer-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setPhotograph(file);

                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      setPhotoPreview(objectUrl);
                    } else {
                      setPhotoPreview("");
                    }
                  }}
                />

                <label
                  htmlFor="officer-photo"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Upload size={17} />
                  Choose Photograph
                </label>

                {photograph && (
                  <p className="mt-2 text-xs text-slate-500">
                    Selected:{" "}
                    {photograph.name}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  JPG, PNG or WEBP • Maximum
                  5 MB
                </p>
              </div>
            </div>
          </section>

          {/* DOCUMENTS */}

          <section className="mt-5 rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2">
              <FileText
                size={19}
                className="text-[#C9A227]"
              />

              <h3 className="font-bold text-[#0B1F3A]">
                Officer Documents
              </h3>
            </div>

            <div className="mt-4">
              <input
                id="officer-documents"
                type="file"
                multiple
                accept=".pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) =>
                  setDocuments(
                    Array.from(
                      event.target.files || []
                    )
                  )
                }
              />

              <label
                htmlFor="officer-documents"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Upload size={17} />
                Choose Documents
              </label>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {documents.map(
                    (file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <FileText
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate text-sm text-slate-600">
                            {file.name}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeDocument(
                              index
                            )
                          }
                          className="ml-3 rounded p-1 text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              {officer.documents &&
                officer.documents.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Uploaded Documents
                    </p>

                    <div className="space-y-2">
                      {officer.documents.map(
                        (document, index) => (
                          <div
  key={`${document}-${index}`}
  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
>
  <a
    href={`${API_ORIGIN}${document}`}
    target="_blank"
    rel="noreferrer"
    className="flex min-w-0 items-center gap-2 text-sm text-[#0B1F3A] hover:underline"
  >
    <FileText
      size={16}
      className="shrink-0"
    />

    <span className="truncate">
      Document {index + 1}
    </span>
  </a>

  <button
    type="button"
    disabled={uploading}
    onClick={() =>
      void handleDeleteDocument(index)
    }
    className="shrink-0 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
  >
    Delete
  </button>
</div>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>
          </section>

          {/* PROMOTION HISTORY */}

          <section className="mt-5 rounded-xl border border-slate-200 p-5">
            <h3 className="font-bold text-[#0B1F3A]">
              Promotion History
            </h3>

            {promotions.length > 0 && (
              <div className="mt-4 space-y-2">
                {promotions.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-slate-50 p-4"
                    >
                      <div className="flex flex-col justify-between gap-1 sm:flex-row">
                        <p className="font-semibold text-[#0B1F3A]">
                          {item.rank}
                        </p>

                        <p className="text-xs text-slate-500">
                          {formatDate(
                            item.date
                          )}
                        </p>
                      </div>

                      {item.orderNumber && (
                        <p className="mt-1 text-xs text-slate-500">
                          Order No:{" "}
                          {item.orderNumber}
                        </p>
                      )}

                      {item.remarks && (
                        <p className="mt-1 text-sm text-slate-600">
                          {item.remarks}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field
                label="Promotion Rank"
                value={promotion.rank}
                onChange={(value) =>
                  setPromotion(
                    (previous) => ({
                      ...previous,
                      rank: value,
                    })
                  )
                }
              />

              <Field
                label="Promotion Date"
                type="date"
                value={promotion.date}
                onChange={(value) =>
                  setPromotion(
                    (previous) => ({
                      ...previous,
                      date: value,
                    })
                  )
                }
              />

              <Field
                label="Order Number"
                value={
                  promotion.orderNumber
                }
                onChange={(value) =>
                  setPromotion(
                    (previous) => ({
                      ...previous,
                      orderNumber: value,
                    })
                  )
                }
              />

              <Field
                label="Remarks"
                value={promotion.remarks}
                onChange={(value) =>
                  setPromotion(
                    (previous) => ({
                      ...previous,
                      remarks: value,
                    })
                  )
                }
              />
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                void handleAddPromotion()
              }
              className="mt-4 rounded-lg border border-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50 disabled:opacity-50"
            >
              {uploading
                ? "Saving..."
                : "Add Promotion"}
            </button>
          </section>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row">
            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                void handleUpload()
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-[#C9A227] px-6 py-3 text-sm font-semibold text-[#0B1F3A] hover:opacity-90 disabled:opacity-50"
            >
              <Upload size={17} />

              {uploading
                ? "Uploading..."
                : "Upload Files"}
            </button>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102A43] disabled:opacity-50"
              >
                <Save size={17} />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
      />
    </div>
  );
}

function Select({
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
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0B1F3A]"
      >
        <option value="">
          Select {label}
        </option>

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



























