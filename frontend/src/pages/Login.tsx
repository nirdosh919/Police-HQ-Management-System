import { useState } from "react";
import type { FormEvent } from "react";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";

export default function Login() {
  const {
    login,
    user,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [email, setEmail] =
    useState(
      "admin@policehq.local"
    );

  const [password, setPassword] =
    useState("Admin@12345");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  if (user) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  async function submit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setError("");
      setLoading(true);

      await login(
        email,
        password
      );

      const from =
        (
          location.state as {
            from?: string;
          } | null
        )?.from ||
        "/dashboard";

      navigate(
        from,
        { replace: true }
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0B1F3A] text-[#C9A227]">
            <ShieldCheck
              size={32}
            />
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
              Police Headquarters
            </p>

            <h1 className="mt-2 text-2xl font-bold text-[#0B1F3A]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to Police HQ Management System
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={submit}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0B1F3A]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-[#0B1F3A]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-bold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <div className="mt-6 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            Default Super Admin:
            <br />
            <span className="font-semibold">
              admin@policehq.local
            </span>
            {" / "}
            <span className="font-semibold">
              Admin@12345
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


