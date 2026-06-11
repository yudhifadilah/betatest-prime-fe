"use client";

import { Suspense } from "react";
import { MailCheck, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-5 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-lg">
        <div className="relative overflow-hidden rounded-[36px] border border-cyan-500/20 bg-white/[0.04] p-8 text-center shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_35%)]" />

          <div className="relative">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-xl shadow-cyan-500/20">
              <MailCheck size={44} />
            </div>

            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
              <ShieldCheck size={17} />
              Email Verification
            </div>

            <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
              Verifikasi Email
            </h1>

            <p className="mt-4 text-lg font-semibold text-gray-300">
              Register berhasil.
            </p>

            <p className="mt-3 text-sm leading-7 text-gray-400">
              Silahkan verifikasi email terlebih dahulu agar akun kamu dapat
              digunakan untuk login.
            </p>

            {email && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                  Email Tujuan
                </p>

                <p className="mt-2 break-all text-base font-extrabold text-cyan-300">
                  {email}
                </p>
              </div>
            )}

            <p className="mt-5 text-sm leading-7 text-gray-400">
              Kami telah mengirim link verifikasi ke email kamu. Klik link
              tersebut agar akun dapat digunakan untuk login.
            </p>

            <Link
              href="/login"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-8 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 md:w-auto"
            >
              Ke Halaman Login
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07111f]">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%)]" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
