import { useEffect, useState } from "react";
import {
  UserCircle,
  ShieldCheck,
  Lock,
  Save,
  KeyRound,
} from "lucide-react";

const API = `${window.location.protocol}//${window.location.hostname}:5000/api`;

type Admin = {
  name: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
};

export default function AdministratorProfile() {
  const token = localStorage.getItem("phq_auth_token");

  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.message || "Unable to load profile");
        }

        const data = json.data;

        setAdmin(data);

        setForm({
          name: data.name || "",
          email: data.email || "",
          department: data.department || "",
          designation: data.designation || "",
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load profile"
        );
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadProfile();
    } else {
      setLoading(false);
      setMessage("Authentication required");
    }
  }, [token]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Profile update failed");
      }

      setAdmin(json.data);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/auth/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(password),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Password change failed");
      }

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage(
        "Password changed successfully. Please login again."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Password change failed"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        Loading administrator profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#07558d]">
          Administration
        </p>

        <h1 className="mt-1 text-3xl font-bold text-[#063b67]">
          Administrator Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your administrator account and security settings.
        </p>
      </div>

      {message && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-[#063b67] shadow-sm">
          {message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">

            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#063b67] text-[#c79a2b]">
              <UserCircle size={62} strokeWidth={1.5} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-[#063b67]">
              {admin?.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {admin?.email}
            </p>

            <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#eaf2f8] px-4 py-2 text-xs font-bold text-[#063b67]">
              <ShieldCheck size={15} />
              {admin?.role}
            </span>

          </div>
        </div>

        <form
          onSubmit={saveProfile}
          className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">
            <UserCircle className="text-[#07558d]" size={22} />

            <div>
              <h2 className="font-bold text-[#063b67]">
                Profile Information
              </h2>

              <p className="text-xs text-slate-500">
                Update your administrator details.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Field
              label="Full Name"
              value={form.name}
              onChange={(value) =>
                setForm({ ...form, name: value })
              }
            />

            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(value) =>
                setForm({ ...form, email: value })
              }
            />

            <Field
              label="Department"
              value={form.department}
              onChange={(value) =>
                setForm({ ...form, department: value })
              }
            />

            <Field
              label="Designation"
              value={form.designation}
              onChange={(value) =>
                setForm({ ...form, designation: value })
              }
            />

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </label>

              <input
                value={admin?.role || ""}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500"
              />
            </div>

          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-[#063b67] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#042d4e] disabled:opacity-60"
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>

        </form>
      </div>

      <form
        onSubmit={savePassword}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >

        <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-4">

          <Lock className="text-[#07558d]" size={22} />

          <div>
            <h2 className="font-bold text-[#063b67]">
              Change Password
            </h2>

            <p className="text-xs text-slate-500">
              Password must contain at least 8 characters.
            </p>
          </div>

        </div>

        <div className="grid gap-5 md:grid-cols-3">

          <PasswordField
            label="Current Password"
            value={password.currentPassword}
            onChange={(value) =>
              setPassword({
                ...password,
                currentPassword: value,
              })
            }
          />

          <PasswordField
            label="New Password"
            value={password.newPassword}
            onChange={(value) =>
              setPassword({
                ...password,
                newPassword: value,
              })
            }
          />

          <PasswordField
            label="Confirm New Password"
            value={password.confirmPassword}
            onChange={(value) =>
              setPassword({
                ...password,
                confirmPassword: value,
              })
            }
          />

        </div>

        <div className="mt-6 flex justify-end">

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg border border-[#063b67] px-5 py-2.5 text-sm font-semibold text-[#063b67] hover:bg-[#eaf2f8] disabled:opacity-60"
          >
            <KeyRound size={17} />
            {saving ? "Updating..." : "Change Password"}
          </button>

        </div>

      </form>

    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#07558d] focus:ring-1 focus:ring-[#07558d]"
      />
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#07558d] focus:ring-1 focus:ring-[#07558d]"
      />
    </div>
  );
}
