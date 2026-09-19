import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Camera, FileText, Upload, X } from "lucide-react";

type OfficerFormData = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup: string;
  employeeId: string;
  beltNumber: string;
  rank: string;
  designation: string;
  department: string;
  headquarters: string;
  district: string;
  state: string;
  currentPosting: string;
  previousPosting: string;
  mobile: string;
  officialEmail: string;
  dateOfJoining: string;
  serviceStatus: string;
  emergencyContact: string;
  address: string;
  promotionHistory: string;
};

type AddOfficerModalProps = {
  onClose: () => void;
  onSave: (officer: OfficerFormData) => void;
};

const initialForm: OfficerFormData = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  employeeId: "",
  beltNumber: "",
  rank: "",
  designation: "",
  department: "",
  headquarters: "",
  district: "",
  state: "",
  currentPosting: "",
  previousPosting: "",
  mobile: "",
  officialEmail: "",
  dateOfJoining: "",
  serviceStatus: "Active",
  emergencyContact: "",
  address: "",
  promotionHistory: "",
};

export default function AddOfficerModal({
  onClose,
  onSave,
}: AddOfficerModalProps) {
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState<File | null>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("phq_auth_token");
    fetch("http://127.0.0.1:5000/api/departments", { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((r) => r.json())
      .then((result) => { if (result.success) setDepartments((result.data || []).map((d: any) => d.name)); })
      .catch((error) => console.error("Department loading error:", error));
  }, []);

  const updateField = (
    field: keyof OfficerFormData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      alert("Please enter officer name.");
      return;
    }

    if (!form.employeeId.trim()) {
      alert("Please enter Employee ID.");
      return;
    }

    if (!form.beltNumber.trim()) {
      alert("Please enter Belt Number.");
      return;
    }

    if (!form.rank) {
      alert("Please select Rank.");
      return;
    }

    if (!form.department) {
      alert("Please select Department.");
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C9A227]">
              Police Headquarters
            </p>

            <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
              Add New Officer
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter complete officer service information.
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

          <SectionTitle title="Personal Information" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <InputField
              label="Full Name"
              required
              value={form.fullName}
              onChange={(value) => updateField("fullName", value)}
              placeholder="Enter full name"
              className="lg:col-span-2"
            />

            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(value) => updateField("gender", value)}
              options={["Male", "Female", "Other"]}
            />

            <SelectField
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(value) => updateField("bloodGroup", value)}
              options={[
                "A+",
                "A-",
                "B+",
                "B-",
                "AB+",
                "AB-",
                "O+",
                "O-",
              ]}
            />

            <InputField
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
            />

            <div className="md:col-span-2 lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Photograph
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 hover:border-[#C9A227]">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
                  <Camera size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {photo ? photo.name : "Upload officer photograph"}
                  </p>

                  <p className="text-xs text-slate-400">
                    JPG, PNG up to 5 MB
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(event) =>
                    setPhoto(event.target.files?.[0] || null)
                  }
                />
              </label>
            </div>
          </div>

          <SectionTitle title="Service Information" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <InputField
              label="Employee ID"
              required
              value={form.employeeId}
              onChange={(value) => updateField("employeeId", value)}
              placeholder="PHQ-XXXXX"
            />

            <InputField
              label="Belt Number"
              required
              value={form.beltNumber}
              onChange={(value) => updateField("beltNumber", value)}
              placeholder="BK-XXXXX"
            />

            <SelectField
              label="Rank"
              required
              value={form.rank}
              onChange={(value) => updateField("rank", value)}
              options={[
                "DSP",
                "Inspector",
                "Sub Inspector",
                "Assistant Sub Inspector",
                "Head Constable",
                "Constable",
              ]}
            />

            <InputField
              label="Designation"
              value={form.designation}
              onChange={(value) => updateField("designation", value)}
              placeholder="Enter designation"
            />

            <SelectField
              label="Department"
              required
              value={form.department}
              onChange={(value) => updateField("department", value)}
              options={departments}
            />

            <SelectField
              label="Service Status"
              value={form.serviceStatus}
              onChange={(value) => updateField("serviceStatus", value)}
              options={["Active", "Suspended", "Retired"]}
            />

            <InputField
              label="Date of Joining"
              type="date"
              value={form.dateOfJoining}
              onChange={(value) => updateField("dateOfJoining", value)}
            />
          </div>

          <SectionTitle title="Posting Information" />

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

            <InputField
              label="Headquarters"
              value={form.headquarters}
              onChange={(value) => updateField("headquarters", value)}
              placeholder="Enter headquarters"
            />

            <InputField
              label="District"
              value={form.district}
              onChange={(value) => updateField("district", value)}
              placeholder="Enter district"
            />

            <InputField
              label="State"
              value={form.state}
              onChange={(value) => updateField("state", value)}
              placeholder="Enter state"
            />

            <InputField
              label="Current Posting"
              value={form.currentPosting}
              onChange={(value) => updateField("currentPosting", value)}
              placeholder="Current posting"
            />

            <InputField
              label="Previous Posting"
              value={form.previousPosting}
              onChange={(value) => updateField("previousPosting", value)}
              placeholder="Previous posting"
              className="lg:col-span-2"
            />
          </div>

          <SectionTitle title="Contact Information" />

          <div className="grid gap-5 md:grid-cols-2">

            <InputField
              label="Mobile Number"
              value={form.mobile}
              onChange={(value) => updateField("mobile", value)}
              placeholder="10 digit mobile number"
            />

            <InputField
              label="Official Email"
              type="email"
              value={form.officialEmail}
              onChange={(value) => updateField("officialEmail", value)}
              placeholder="official@police.gov.in"
            />

            <InputField
              label="Emergency Contact"
              value={form.emergencyContact}
              onChange={(value) =>
                updateField("emergencyContact", value)
              }
              placeholder="Emergency contact number"
            />

            <TextAreaField
              label="Address"
              value={form.address}
              onChange={(value) => updateField("address", value)}
              placeholder="Complete residential address"
            />
          </div>

          <SectionTitle title="Promotion History" />

          <TextAreaField
            label="Promotion History"
            value={form.promotionHistory}
            onChange={(value) =>
              updateField("promotionHistory", value)
            }
            placeholder="Enter promotion history..."
          />

          <SectionTitle title="Documents" />

          <label className="flex cursor-pointer items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 hover:border-[#C9A227]">

            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#0B1F3A] text-[#C9A227]">
              <FileText size={21} />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700">
                {document
                  ? document.name
                  : "Upload service documents"}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG or PNG
              </p>
            </div>

            <Upload size={20} className="text-slate-400" />

            <input
              type="file"
              accept=".pdf,image/png,image/jpeg"
              className="hidden"
              onChange={(event) =>
                setDocument(event.target.files?.[0] || null)
              }
            />
          </label>

          <div className="mt-8 flex flex-col-reverse justify-end gap-3 border-t border-slate-200 pt-5 sm:flex-row">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#102A43]"
            >
              <Upload size={17} />
              Save Officer
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-5 mt-7 first:mt-0">
      <h3 className="text-base font-bold text-[#0B1F3A]">
        {title}
      </h3>
      <div className="mt-2 h-px bg-slate-100" />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0B1F3A] focus:ring-1 focus:ring-[#0B1F3A]"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#0B1F3A]"
      >
        <option value="">Select {label}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-[#0B1F3A]"
      />
    </div>
  );
}



