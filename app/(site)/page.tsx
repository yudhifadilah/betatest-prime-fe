import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard,
  Star,
  Wallet,
  Gamepad2,
  Gift,
  Gem,
} from "lucide-react";
import { FaDiscord, FaInstagram, FaTiktok } from "react-icons/fa";

export default function HomePage() {
  const testimonials = [
    { name: "Rizky", text: "Payout super cepat, trusted banget 🔥" },
    { name: "Fajar", text: "Vilog aman dan prosesnya cepet banget." },
    { name: "Aldo", text: "Udah berkali-kali order gifting aman semua." },
  ];

  const products = [
    { name: "Payout", href: "/payout", icon: <Wallet size={30} /> },
    { name: "Vilog", href: "/vilog", icon: <Gamepad2 size={30} /> },
    { name: "Gifting", href: "/gifting", icon: <Gift size={30} /> },
    { name: "Limited Items", href: "/lims", icon: <Gem size={30} /> },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      {/* GLOBAL BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[#07111f]" />

      <div className="pointer-events-none absolute left-1/2 top-[-200px] z-0 h-[1200px] w-[1600px] -translate-x-1/2 rounded-full bg-cyan-500/12 blur-[220px]" />

      <div className="pointer-events-none absolute right-[-250px] top-[200px] z-0 h-[900px] w-[900px] rounded-full bg-blue-600/10 blur-[220px]" />

      <div className="pointer-events-none absolute left-1/2 top-[700px] z-0 h-[900px] w-[1600px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[240px]" />

      <div className="pointer-events-none absolute left-[-300px] top-[1500px] z-0 h-[900px] w-[900px] rounded-full bg-cyan-500/8 blur-[220px]" />

      <div className="pointer-events-none absolute right-[-250px] top-[2400px] z-0 h-[900px] w-[900px] rounded-full bg-blue-500/8 blur-[220px]" />

      <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(7,17,31,0)_0%,rgba(7,17,31,0.08)_20%,rgba(7,17,31,0.16)_45%,rgba(7,17,31,0.28)_100%)]" />

      {/* HERO */}
      <section className="relative z-10 overflow-hidden bg-transparent">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-28 pt-24 lg:grid-cols-2 lg:pt-28">
          <div>
            <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10">
              🔥 Trusted Roblox Topup Store
            </span>

            <h1 className="mt-8 text-5xl font-extrabold leading-tight md:text-7xl">
              Topup Roblox
              <span className="block text-cyan-400">Lebih Cepat & Aman</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Beli produk <span className="text-cyan-400">Payout</span>,{" "}
              <span className="text-cyan-400">Vilog</span>,{" "}
              <span className="text-cyan-400">Gifting</span>, dan{" "}
              <span className="text-cyan-400">Limited Items</span> dengan proses
              cepat, aman, dan terpercaya.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="group flex items-center gap-2 rounded-2xl bg-cyan-500 px-7 py-4 text-lg font-bold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400"
              >
                Belanja Sekarang
                <ArrowRight
                  size={20}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/register"
                className="rounded-2xl border border-white/15 bg-white/5 px-7 py-4 text-lg font-semibold transition hover:bg-white/10"
              >
                Daftar Akun
              </Link>
            </div>

            <div className="mt-14 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                <Zap className="text-cyan-400" size={32} />
                <h3 className="mt-3 text-lg font-bold">Proses Cepat</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Order diproses dengan cepat & aman.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                <ShieldCheck className="text-green-400" size={32} />
                <h3 className="mt-3 text-lg font-bold">Aman</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Transaksi terpercaya & support penuh.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
                <CreditCard className="text-yellow-400" size={32} />
                <h3 className="mt-3 text-lg font-bold">Payment Mudah</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Mendukung berbagai metode pembayaran.
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute right-[-120px] top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[180px]" />

            <div className="relative flex h-[520px] w-full items-center justify-center overflow-visible md:h-[650px] lg:h-[760px] lg:translate-x-32">
              <Image
                src="/images/primeblox1.png"
                alt="Prime Blox"
                width={1800}
                height={1400}
                priority
                className="relative z-10 h-auto w-[120%] max-w-none object-contain drop-shadow-[0_35px_100px_rgba(0,255,255,0.25)] transition duration-500 hover:scale-105 md:w-[130%] lg:w-[150%]"
              />
            </div>
          </div>
        </div>
      </section>

{/* PRODUCT */}
<section className="relative z-10 overflow-hidden bg-transparent">
{/* PRIMEBLOX BACKGROUND */}
<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
  <Image
    src="/images/primeblox1.png"
    alt="PrimeBlox Background"
    width={1300}
    height={1300}
    className="translate-y-15 h-auto w-[700px] opacity-[0.035] blur-[1px] md:w-[900px] lg:w-[1100px]"
  />
</div>

  {/* CYAN GLOW */}
  <div className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[160px]" />

  <div className="relative mx-auto max-w-7xl px-6 py-20">
    <div className="border-t border-white/10 pt-16 text-center">
      <span className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300">
        🎮 Roblox Service
      </span>

      <h2 className="mt-6 text-4xl font-bold md:text-5xl">
        Produk Yang Tersedia
      </h2>

      <p className="mt-3 text-gray-400">
        Pilih layanan Roblox favorit kamu
      </p>
    </div>

    <div className="relative mt-14 grid gap-6 md:grid-cols-4">
      {[
        {
          name: "Payout",
          href: "/payout",
          image: "/images/Char1.png",
        },
        {
          name: "Vilog",
          href: "/vilog",
          image: "/images/Char2.png",
        },
        {
          name: "Gifting",
          href: "/gifting",
          image: "/images/Char3.png",
        },
        {
          name: "Limited Items",
          href: "/lims",
          image: "/images/Char4.png",
        },
      ].map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-cyan-500/5"
        >
          {/* CARD GLOW */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.10),transparent_55%)]" />

          {/* CHARACTER */}
          <div className="relative flex h-[220px] items-end justify-center overflow-hidden rounded-[26px] border border-cyan-400/10 bg-gradient-to-b from-cyan-500/10 to-transparent">
            <div className="absolute inset-0 bg-cyan-500/10 blur-3xl" />

            <Image
              src={item.image}
              alt={item.name}
              width={320}
              height={320}
              className="relative z-10 h-[105%] w-auto object-contain transition duration-500 group-hover:scale-105"
            />
          </div>

          {/* DOLLAR ICON */}
          <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-2xl font-black text-cyan-400 shadow-lg shadow-cyan-500/10">
            $
          </div>

          <h3 className="mt-5 text-2xl font-bold">
            {item.name}
          </h3>

          <p className="mt-3 text-sm leading-6 text-gray-400">
            Layanan {item.name} Roblox cepat,
            aman, terpercaya dengan proses
            profesional.
          </p>

          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-cyan-400 transition-all group-hover:gap-3">
            Lihat Produk
            <ArrowRight size={18} />
          </span>
        </Link>
      ))}
    </div>
  </div>
</section>

{/* TESTIMONI */}
<section className="relative z-10 overflow-hidden bg-transparent">
  <div className="relative mx-auto max-w-7xl px-6 py-20">
    <div className="border-t border-white/10 pt-16 text-center">
      <h2 className="text-4xl font-bold">
        Vouch / Testimoni
      </h2>

      <p className="mt-3 text-gray-400">
        Apa kata pelanggan kami?
      </p>
    </div>

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {testimonials.map((item, index) => (
        <div
          key={index}
          className="group relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl transition duration-300 hover:-translate-y-2 hover:border-cyan-400/40 hover:bg-cyan-500/5"
        >
          {/* Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.08),transparent_55%)]" />

          {/* Discord */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex gap-1 text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  fill="currentColor"
                  size={18}
                />
              ))}
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#5865F2]/20 bg-[#5865F2]/10 text-[#5865F2]">
              <FaDiscord size={24} />
            </div>
          </div>

          {/* Text */}
          <p className="relative z-10 mt-6 text-sm leading-7 text-gray-300">
            "{item.text}"
          </p>

          {/* User */}
          <div className="relative z-10 mt-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400">
              {item.name.charAt(0)}
            </div>

            <div>
              <h4 className="font-bold text-cyan-400">
                {item.name}
              </h4>

              <p className="text-xs text-gray-500">
                Verified Customer
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* SOCIAL */}
<section className="relative z-10 overflow-hidden bg-transparent">
  {/* Background Character */}
  <div className="pointer-events-none absolute bottom-[-10px] left-[-80px] opacity-[0.06]">
    <Image
      src="/images/Char1.png"
      alt="Character Left"
      width={500}
      height={500}
      className="h-auto w-[280px] md:w-[420px]"
    />
  </div>

  <div className="pointer-events-none absolute bottom-[-5px] right-[-80px] opacity-[0.06]">
    <Image
      src="/images/Char2.png"
      alt="Character Right"
      width={500}
      height={500}
      className="h-auto w-[280px] md:w-[420px]"
    />
  </div>

  <div className="relative mx-auto max-w-7xl px-6 py-20">
    <div className="rounded-[40px] border border-cyan-500/20 bg-white/[0.04] p-10 shadow-2xl shadow-cyan-500/10 backdrop-blur-md">
      <div className="text-center">
        <h2 className="text-4xl font-bold">
          Join Komunitas Kami
        </h2>

        <p className="mt-3 text-gray-400">
          Ikuti social media kami untuk promo
          terbaru & update stok.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <Link
          href="https://discord.gg/topupstore"
          target="_blank"
          className="flex items-center justify-center gap-3 rounded-2xl border border-[#5865F2]/30 bg-[#5865F2]/20 px-6 py-4 font-semibold transition hover:scale-105"
        >
          <FaDiscord size={28} />
          Discord
        </Link>

        <Link
          href="https://instagram.com/topupstore"
          target="_blank"
          className="flex items-center justify-center gap-3 rounded-2xl border border-pink-500/30 bg-pink-500/20 px-6 py-4 font-semibold transition hover:scale-105"
        >
          <FaInstagram size={28} />
          Instagram
        </Link>

        <Link
          href="https://tiktok.com/@topupstore"
          target="_blank"
          className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 font-semibold transition hover:scale-105"
        >
          <FaTiktok size={28} />
          TikTok
        </Link>
      </div>
    </div>
  </div>
</section>

      <Footer />
    </main>
  );
}