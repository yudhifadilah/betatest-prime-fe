"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ReceiptText,
  Search,
  MessageCircle,
  ShoppingBag,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Clock3,
  CheckCircle2,
  CreditCard,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

type BuyerUser = {
  name?: string;
  email?: string;
  role?: string;
};

export default function BuyerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<BuyerUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      router.replace("/");
      return;
    }

    if (role !== "buyer") {
      router.replace("/dashboard");
      return;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }

    setChecking(false);
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.dispatchEvent(new Event("auth-changed"));
    router.push("/");
  };

  if (checking) return null;

  const nameLabel = user?.name || user?.email || "Buyer";

  return (
    <main className="min-h-screen bg-neutral-100 p-4 text-black md:p-8">
      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[320px_1fr]">
        {/* SIDEBAR BUYER */}
        <aside className="rounded-[34px] border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-7 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-[22px] bg-black shadow-lg">
              <Image
                src="/images/LogoPrime.png"
                alt="PrimeBlox Logo"
                width={56}
                height={56}
                className="h-full w-full object-contain p-1"
                priority
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold leading-none text-black">
                PrimeBlox
              </h1>
              <p className="mt-1 text-sm text-neutral-500">
                Buyer Dashboard
              </p>
            </div>
          </div>

          <div className="mb-6 rounded-[26px] bg-gradient-to-br from-neutral-950 to-neutral-800 p-5 text-white shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck size={22} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold">Buyer Access</p>

                <p className="mt-2 truncate text-xs text-white/60">
                  Name:
                  <span className="ml-1 font-semibold text-white">
                    {nameLabel}
                  </span>
                </p>

                <p className="mt-1 text-xs text-white/60">
                  Role:
                  <span className="ml-1 font-semibold text-white">
                    Buyer
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3">
              <p className="text-xs text-white/60">Status</p>
              <p className="text-sm font-semibold text-white">
                Online & Verified
              </p>
            </div>
          </div>

          <nav className="space-y-2">
            <Link
              href="/buyer-dashboard"
              className="flex items-center justify-between rounded-[22px] bg-black px-3 py-3 font-semibold text-white shadow-lg"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Home size={22} />
                </span>
                Dashboard
              </span>
              <ChevronRight size={18} />
            </Link>

            <Link
              href="/shop"
              className="flex items-center justify-between rounded-[22px] px-3 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <ShoppingBag size={22} />
                </span>
                Belanja
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>

            <Link
              href="/buyer-dashboard/orders"
              className="flex items-center justify-between rounded-[22px] px-3 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <ReceiptText size={22} />
                </span>
                Transaksi Saya
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>

            <Link
              href="/cek-transaksi"
              className="flex items-center justify-between rounded-[22px] px-3 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <Search size={22} />
                </span>
                Cek Transaksi
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>

            <Link
              href="/buyer-dashboard/chat"
              className="flex items-center justify-between rounded-[22px] px-3 py-3 font-semibold text-neutral-700 transition hover:bg-neutral-100"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <MessageCircle size={22} />
                </span>
                Live Chat
              </span>
              <ChevronRight size={18} className="text-neutral-300" />
            </Link>
          </nav>

          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-[22px] bg-red-500 py-4 font-semibold text-white shadow-lg transition hover:bg-red-600 active:scale-[0.98]"
          >
            <LogOut size={20} />
            Logout
          </button>
        </aside>

        {/* CONTENT */}
        <section className="space-y-6">
          <div className="rounded-[34px] border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-neutral-400">
                  Buyer Dashboard
                </p>

                <h2 className="mt-3 text-3xl font-black text-black md:text-4xl">
                  Selamat datang, {nameLabel}
                </h2>

                <p className="mt-3 max-w-2xl text-neutral-500">
                  Pantau transaksi, cek status order, dan lanjutkan pembelian
                  produk PrimeBlox dengan cepat.
                </p>
              </div>

              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-bold text-white shadow-lg transition hover:bg-neutral-800"
              >
                <ShoppingBag size={20} />
                Mulai Belanja
              </Link>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                <Clock3 size={24} />
              </div>
              <p className="text-sm text-neutral-500">Pending</p>
              <h3 className="mt-2 text-3xl font-black">0</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Pesanan menunggu diproses.
              </p>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <CreditCard size={24} />
              </div>
              <p className="text-sm text-neutral-500">Diproses</p>
              <h3 className="mt-2 text-3xl font-black">0</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Pesanan sedang dikerjakan.
              </p>
            </div>

            <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <p className="text-sm text-neutral-500">Selesai</p>
              <h3 className="mt-2 text-3xl font-black">0</h3>
              <p className="mt-2 text-sm text-neutral-400">
                Pesanan berhasil selesai.
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-xl font-black text-black">
                  Menu Cepat
                </h3>
                <Store size={22} className="text-neutral-400" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Link
                  href="/vilog"
                  className="rounded-2xl border border-neutral-200 p-4 font-bold transition hover:bg-neutral-50"
                >
                  Vilog
                  <p className="mt-1 text-sm font-normal text-neutral-500">
                    Order jasa vilog.
                  </p>
                </Link>

                <Link
                  href="/payout"
                  className="rounded-2xl border border-neutral-200 p-4 font-bold transition hover:bg-neutral-50"
                >
                  Payout
                  <p className="mt-1 text-sm font-normal text-neutral-500">
                    Order payout Roblox.
                  </p>
                </Link>

                <Link
                  href="/gifting"
                  className="rounded-2xl border border-neutral-200 p-4 font-bold transition hover:bg-neutral-50"
                >
                  Gifting
                  <p className="mt-1 text-sm font-normal text-neutral-500">
                    Order gifting item.
                  </p>
                </Link>

                <Link
                  href="/limited-items"
                  className="rounded-2xl border border-neutral-200 p-4 font-bold transition hover:bg-neutral-50"
                >
                  Limited Item
                  <p className="mt-1 text-sm font-normal text-neutral-500">
                    Order item limited.
                  </p>
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-black text-black">
                Transaksi Terbaru
              </h3>

              <div className="mt-5 rounded-2xl border border-dashed border-neutral-300 p-6 text-center">
                <ReceiptText
                  size={36}
                  className="mx-auto mb-3 text-neutral-300"
                />
                <p className="font-bold text-neutral-700">
                  Belum ada transaksi
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Setelah buyer melakukan order, transaksi akan tampil di sini.
                </p>
              </div>

              <Link
                href="/cek-transaksi"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-950 py-4 font-bold text-white transition hover:bg-neutral-800"
              >
                <Search size={19} />
                Cek Transaksi
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}