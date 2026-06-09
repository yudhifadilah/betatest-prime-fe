"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff, UserPlus, ShieldCheck, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterResponse = {
  success?: boolean;
  message?: string;
  error?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const goToVerifyEmailPage = () => {
    router.replace(`/verify-email?email=${encodeURIComponent(form.email)}`);
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://192.168.1.7:3030/api/auth/register", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      let data: RegisterResponse | null = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      console.log("REGISTER STATUS:", response.status);
      console.log("REGISTER RESPONSE:", data);

      if (response.status === 409) {
        alert(data?.message || "Email sudah terdaftar");
        return;
      }

      if (response.status === 400) {
        alert(data?.message || data?.error || "Data register tidak valid");
        return;
      }

      goToVerifyEmailPage();
    } catch (error) {
      console.error("REGISTER ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Register gagal, cek koneksi API"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="overflow-hidden rounded-[36px] border border-cyan-500/20 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(0,255,255,0.08)] backdrop-blur-xl">
          <div className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[32px] border border-cyan-400/20 bg-cyan-500/10 shadow-xl shadow-cyan-500/10">
              <div className="relative flex h-24 w-24 items-center justify-center">
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
              ✨ Create Account
            </span>

            <h1 className="mt-5 text-4xl font-extrabold">Register</h1>

            <p className="mt-2 text-sm text-gray-400">
              Buat akun baru PrimeBlox
            </p>
          </div>

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

          <form onSubmit={handleRegister} className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Nama Lengkap
              </label>

              <input
                type="text"
                placeholder="Nama lengkap"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-300">
                Email
              </label>

              <input
                type="email"
                placeholder="Email"
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Password minimal 6 karakter"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 pr-14 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
                  required
                  minLength={6}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-cyan-400"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus size={20} />
              {loading ? "Loading..." : "Register"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-400">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-bold text-cyan-400 transition hover:text-cyan-300"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}