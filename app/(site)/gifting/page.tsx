"use client";

import { useState } from "react";
import {
  ShoppingCart,
  ShieldCheck,
  Clock3,
  Gift,
} from "lucide-react";

type GiftingPackage = {
  id: number;
  title: string;
  price: number;
  robux: number;
  description: string;
};

export default function GiftingPage() {
  const [username, setUsername] = useState("");
  const [giftUsername, setGiftUsername] = useState("");

  const giftingPackages: GiftingPackage[] = [
    {
      id: 1,
      title: "Gift Basic",
      price: 25000,
      robux: 100,
      description: "Gift item Roblox basic",
    },
    {
      id: 2,
      title: "Gift Premium",
      price: 75000,
      robux: 500,
      description: "Gift item Roblox premium",
    },
    {
      id: 3,
      title: "Gift Ultimate",
      price: 150000,
      robux: 1000,
      description: "Gift item Roblox unlimited",
    },
  ];

  const handleBuy = (pkg: GiftingPackage) => {
    if (!username) {
      alert("Masukkan username pengirim");
      return;
    }

    if (!giftUsername) {
      alert("Masukkan username penerima gift");
      return;
    }

    alert(`
Pembelian berhasil!

Pengirim: ${username}
Penerima: ${giftUsername}
Produk: ${pkg.title}
Robux: ${pkg.robux}
    `);
  };

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] bg-gradient-to-r from-black to-neutral-800 p-8 text-white shadow-2xl">
          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium">
            Roblox Gifting
          </span>

          <h1 className="mt-5 text-4xl font-bold md:text-5xl">
            Gifting Roblox
          </h1>

          <p className="mt-3 max-w-2xl text-neutral-300">
            Kirim item Roblox ke teman atau akun lain dengan cepat,
            aman, dan terpercaya.
          </p>

          <div className="mt-8 flex flex-wrap gap-5">
            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <ShieldCheck size={20} />
              <span>Aman</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <Clock3 size={20} />
              <span>Proses Cepat</span>
            </div>

            <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-3">
              <Gift size={20} />
              <span>Instant Gift</span>
            </div>
          </div>
        </div>

        <section className="mt-10 rounded-[32px] bg-white p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-black">
            Informasi Gift
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Username Pengirim
              </label>

              <input
                type="text"
                placeholder="Contoh: HAKENAIZ"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">
                Username Penerima
              </label>

              <input
                type="text"
                placeholder="Contoh: NotMatter"
                value={giftUsername}
                onChange={(e) => setGiftUsername(e.target.value)}
                className="w-full rounded-2xl border border-neutral-200 px-5 py-4 text-black outline-none transition focus:border-black"
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-3xl font-bold text-black">
            Pilih Paket Gifting
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {giftingPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <h3 className="text-2xl font-bold text-black">
                  {pkg.title}
                </h3>

                <p className="mt-2 text-neutral-500">
                  {pkg.description}
                </p>

                <div className="mt-5 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-800">
                  {pkg.robux.toLocaleString("id-ID")} Robux
                </div>

                <h4 className="mt-6 text-3xl font-bold text-black">
                  Rp {pkg.price.toLocaleString("id-ID")}
                </h4>

                <button
                  onClick={() => handleBuy(pkg)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 py-4 font-semibold text-white transition hover:opacity-90"
                >
                  <ShoppingCart size={20} />
                  Beli Sekarang
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}