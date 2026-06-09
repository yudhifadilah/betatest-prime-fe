"use client";

import Image from "next/image";
import Link from "next/link";
import { Store, Clock3, ShieldCheck } from "lucide-react";
import { FaDiscord, FaTiktok, FaWhatsapp } from "react-icons/fa";

export default function StoreClosedPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-6 py-10 text-white">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />

      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[38px] border border-cyan-500/20 bg-white/[0.04] p-8 shadow-[0_20px_80px_rgba(0,255,255,0.08)] backdrop-blur-2xl md:p-10">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_10%,rgba(6,182,212,0.12),transparent_35%)]" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] border border-cyan-400/20 bg-cyan-500/10 shadow-xl shadow-cyan-500/10">
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

          <span className="mx-auto flex w-fit items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300">
            <Store size={16} />
            Store Closed
          </span>

          <h1 className="mt-5 text-center text-4xl font-extrabold tracking-tight md:text-5xl">
            Toko Sedang Tutup
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-center text-sm leading-7 text-gray-400 md:text-base">
            Saat ini toko sedang tidak menerima order. Jangan khawatir, kami
            akan segera kembali online. Join komunitas kami agar tidak
            ketinggalan update dan promo terbaru.
          </p>

          <div className="mt-8 rounded-[28px] border border-red-400/20 bg-red-500/10 p-5 text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-red-300">
              <Clock3 size={18} />
              <span className="font-semibold">Jam Operasional</span>
            </div>

            <p className="text-lg font-extrabold text-white">
              09.00 – 22.00 WIB
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300">
              <ShieldCheck size={18} />
              Aman & Terpercaya
            </div>

            <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-cyan-300">
              <Clock3 size={18} />
              Update Realtime
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-5 text-center text-lg font-extrabold text-white">
              Bergabung Dengan Komunitas Kami
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                href="https://discord.gg/YOURSERVER"
                target="_blank"
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-[#5865F2]/40 hover:bg-[#5865F2]/15"
              >
                <div className="mb-3 flex justify-center text-[32px] text-[#5865F2] transition group-hover:scale-110">
                  <FaDiscord />
                </div>

                <p className="text-center text-sm font-bold text-white">
                  Discord
                </p>
              </Link>

              <Link
                href="https://wa.me/628123456789"
                target="_blank"
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-green-500/40 hover:bg-green-500/15"
              >
                <div className="mb-3 flex justify-center text-[32px] text-green-400 transition group-hover:scale-110">
                  <FaWhatsapp />
                </div>

                <p className="text-center text-sm font-bold text-white">
                  WhatsApp
                </p>
              </Link>

              <Link
                href="https://tiktok.com/@topupstore"
                target="_blank"
                className="group rounded-[24px] border border-white/10 bg-white/[0.04] p-5 transition hover:-translate-y-1 hover:border-cyan-500/40 hover:bg-cyan-500/15"
              >
                <div className="mb-3 flex justify-center text-[32px] text-cyan-400 transition group-hover:scale-110">
                  <FaTiktok />
                </div>

                <p className="text-center text-sm font-bold text-white">
                  TikTok
                </p>
              </Link>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-5 text-center text-sm text-gray-500">
            Butuh bantuan? Hubungi kami melalui{" "}
            <span className="font-semibold text-cyan-400">
              komunitas resmi
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}