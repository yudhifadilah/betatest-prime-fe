"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Lock,
} from "lucide-react";

type UserRole = "admin" | "staff" | "buyer";

type LoginResponse = {
  success?: boolean;
  message?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
};

export default function LoginPage() {
  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const getRoleFromToken = (
    token: string
  ): UserRole | null => {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const role =
        payload.role ||
        payload.user?.role ||
        payload.data?.role ||
        payload.userRole ||
        null;

      const cleanRole = String(role).toLowerCase();

      if (
        cleanRole === "admin" ||
        cleanRole === "staff" ||
        cleanRole === "buyer"
      ) {
        return cleanRole as UserRole;
      }

      return null;
    } catch {
      return null;
    }
  };

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

const response = await fetch(
  `${API_URL}/api/auth/login`,
  {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: form.email,
      password: form.password,
    }),
  }
);

      const data: LoginResponse =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login gagal"
        );
      }

      const token = data.token;

      if (!token) {
        throw new Error(
          "JWT token tidak ditemukan dari response API"
        );
      }

      const roleFromUser = data.user?.role
        ? (String(data.user.role).toLowerCase() as UserRole)
        : null;

      const roleFromToken =
        getRoleFromToken(token);

      const finalRole =
        roleFromUser || roleFromToken;

      if (!finalRole) {
        throw new Error(
          "Role user tidak ditemukan dari response API / token"
        );
      }

      const userData = data.user
        ? {
            ...data.user,
            role: finalRole,
          }
        : {
            role: finalRole,
          };

      localStorage.setItem("token", token);
      localStorage.setItem(
        "role",
        finalRole
      );
      localStorage.setItem(
        "user",
        JSON.stringify(userData)
      );

      window.dispatchEvent(
        new Event("storage")
      );

      if (
        finalRole === "admin" ||
        finalRole === "staff"
      ) {
        window.location.replace(
          "/dashboard"
        );
        return;
      }

      window.location.replace("/");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Login gagal"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-5 py-10 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[36px] border border-cyan-500/20 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(0,255,255,0.08)] backdrop-blur-xl">
          {/* HEADER */}
          <div className="text-center">
            {/* PRIMEBLOX LOGO */}
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-cyan-400/20 bg-cyan-500/10 shadow-xl shadow-cyan-500/10">
              <div className="relative flex h-24 w-24 items-center justify-center">
                {/* Glow */}
                <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-2xl" />

                <Image
                  src="/images/LogoPrime.png"
                  alt="PrimeBlox"
                  width={95}
                  height={95}
                  priority
                  className="relative z-10 h-auto w-auto object-contain drop-shadow-[0_10px_35px_rgba(0,255,255,0.35)]"
                />
              </div>
            </div>

            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300">
              🔐 Secure Login
            </span>

            <h1 className="mt-5 text-4xl font-extrabold">
              Login
            </h1>

            <p className="mt-2 text-sm text-gray-400">
              Masuk ke akun PrimeBlox
            </p>
          </div>

          {/* FEATURES */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-cyan-300 backdrop-blur">
              <ShieldCheck size={16} />
              Aman
            </div>

            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-cyan-300 backdrop-blur">
              <Lock size={16} />
              Secure Access
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Email
              </label>

              <input
                type="email"
                placeholder="Masukkan email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password:
                        e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 pr-14 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-cyan-400"
                >
                  {showPassword ? (
                    <EyeOff size={22} />
                  ) : (
                    <Eye size={22} />
                  )}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <LogIn size={20} />
              {loading
                ? "Loading..."
                : "Login"}
            </button>
          </form>

          {/* REGISTER */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}