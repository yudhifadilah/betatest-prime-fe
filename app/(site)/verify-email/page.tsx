"use client";

import { Suspense } from "react";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-5 py-10">
      <div className="w-full max-w-lg rounded-[36px] border border-neutral-200 bg-white p-10 text-center shadow-2xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[32px] bg-black text-white">
          <MailCheck size={44} />
        </div>

        <h1 className="mt-6 text-4xl font-bold text-black">
          Verifikasi Email
        </h1>

        <p className="mt-4 text-lg text-neutral-600">Register berhasil.</p>

        <p className="mt-3 text-neutral-500">
          Silahkan verifikasi email terlebih dahulu.
        </p>

        {email && (
          <p className="mt-2 break-all text-lg font-bold text-black">
            {email}
          </p>
        )}

        <p className="mt-5 text-sm text-neutral-500">
          Kami telah mengirim link verifikasi ke email kamu. Klik link tersebut
          agar akun dapat digunakan untuk login.
        </p>

        <Link
          href="/login"
          className="mt-8 inline-flex rounded-2xl bg-black px-8 py-4 font-semibold text-white transition hover:opacity-90"
        >
          Ke Halaman Login
        </Link>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}