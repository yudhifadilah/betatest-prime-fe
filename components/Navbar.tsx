"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House,
  ShoppingBag,
  LogOut,
  User,
  UserPlus,
  Clock,
  PanelLeftOpen,
  X,
  ChevronDown,
  Gift,
  Wallet,
  Gamepad2,
  SearchCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const LOGO_SRC = "/images/LogoPrime.png";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    router.push("/login");
  };

  const navItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <House size={22} />,
    },
    {
      label: "Cek Transaksi",
      href: "/cektransaksi",
      icon: <SearchCheck size={22} />,
    },
  ];

  const shopItems: NavItem[] = [
    {
      label: "Vilog",
      href: "/vilog",
      icon: <Gamepad2 size={22} />,
    },
    {
      label: "Payout",
      href: "/payout",
      icon: <Wallet size={22} />,
    },
    {
      label: "Gifting",
      href: "/gifting",
      icon: <Gift size={22} />,
    },
    {
      label: "Limited-items",
      href: "/lims",
      icon: <Gift size={22} />,
    },
  ];

  const isShopActive =
    pathname.startsWith("/shop") ||
    pathname.startsWith("/vilog") ||
    pathname.startsWith("/payout") ||
    pathname.startsWith("/gifting") ||
    pathname.startsWith("/lims");

  return (
    <>
      <input id="sidebar-toggle" type="checkbox" className="peer hidden" />

      <header className="fixed left-0 top-0 z-50 w-full border-b border-cyan-500/10 bg-[#07111f]/95 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-24 shrink-0">
              <Image
                src={LOGO_SRC}
                alt="Prime Blox Logo"
                fill
                sizes="96px"
                className="object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                priority
              />
            </div>

            <div className="leading-none">
              <h1 className="text-[26px] font-black uppercase tracking-wide text-white">
                PRIME
                <span className="ml-1 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  BLOX
                </span>
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                Roblox Topup Service
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30"
                      : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <div className="group relative">
              <button
                type="button"
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isShopActive
                    ? "bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30"
                    : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                }`}
              >
                <ShoppingBag size={22} />
                Shop
                <ChevronDown
                  size={16}
                  className="transition-transform group-hover:rotate-180"
                />
              </button>

              <div className="invisible absolute left-0 top-11 w-60 translate-y-2 rounded-2xl border border-cyan-500/10 bg-[#0f172a]/95 p-2 opacity-0 shadow-2xl backdrop-blur-2xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {shopItems.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-500 text-[#07111f]"
                          : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-cyan-500/20 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/10"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-[#07111f] shadow-lg shadow-cyan-500/30 transition hover:scale-105 hover:bg-cyan-400"
                >
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                <LogOut size={18} />
                Logout
              </button>
            )}
          </nav>

          <label
            htmlFor="sidebar-toggle"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-cyan-500/20 bg-white/5 text-cyan-300 shadow-lg backdrop-blur-xl md:hidden"
          >
            <PanelLeftOpen size={26} />
          </label>
        </div>
      </header>

      <div className="fixed left-0 top-16 z-40 w-full border-y border-cyan-500/10 bg-[#07111f]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-10 max-w-7xl items-center overflow-hidden px-5">
          <div className="animate-marquee flex min-w-max whitespace-nowrap">
            {[1, 2, 3].map((item) => (
              <span
                key={item}
                className="mx-10 text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300"
              >
                ▲ Prime Blox Promo • Vilog Ready • Payout Cepat • Gifting Aman •
                Limited Item Tersedia • Cek Transaksi Via Order ID • Jam Buka
                09.00 - 22.00 WIB •
              </span>
            ))}
          </div>
        </div>
      </div>

      <label
        htmlFor="sidebar-toggle"
        className="fixed inset-0 z-[80] hidden bg-black/60 backdrop-blur-md peer-checked:block md:hidden"
      />

      <aside className="fixed left-0 top-0 z-[90] h-full w-[82%] max-w-sm -translate-x-full border-r border-cyan-500/10 bg-[#07111f]/95 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 peer-checked:translate-x-0 md:hidden">
        <div className="flex h-full flex-col">
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-14 w-24 shrink-0">
                <Image
                  src={LOGO_SRC}
                  alt="Prime Blox Logo"
                  fill
                  sizes="96px"
                  className="object-contain drop-shadow-[0_0_18px_rgba(34,211,238,0.35)]"
                  priority
                />
              </div>

              <div>
                <h2 className="text-2xl font-black uppercase tracking-wide text-white">
                  PRIME
                  <span className="ml-1 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                    BLOX
                  </span>
                </h2>

                <p className="text-xs tracking-wide text-slate-400">
                  Roblox Topup Service
                </p>
              </div>
            </Link>

            <label
              htmlFor="sidebar-toggle"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-cyan-500/20 bg-white/5 text-cyan-300 shadow-md"
            >
              <X size={22} />
            </label>
          </div>

          <div className="mb-6 rounded-3xl border border-cyan-500/10 bg-cyan-500/5 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30">
                <Clock size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Jam Buka Toko
                </p>
                <p className="mt-1 text-sm text-slate-400">Senin - Minggu</p>
                <p className="text-sm font-bold text-cyan-300">
                  09.00 - 22.00 WIB
                </p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-base font-semibold transition ${
                    active
                      ? "bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30"
                      : "bg-white/5 text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            <div className="rounded-2xl border border-cyan-500/10 bg-white/5 p-2">
              <div
                className={`flex items-center gap-4 rounded-xl px-3 py-3 text-base font-semibold ${
                  isShopActive
                    ? "bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/30"
                    : "text-slate-300"
                }`}
              >
                <ShoppingBag size={22} />
                Shop
              </div>

              <div className="mt-2 flex flex-col gap-2 pl-4">
                {shopItems.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                        active
                          ? "bg-cyan-500 text-[#07111f]"
                          : "text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400"
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="flex items-center gap-4 rounded-2xl bg-white/5 px-5 py-4 text-base font-semibold text-slate-300 transition hover:bg-cyan-500/10 hover:text-cyan-400"
                >
                  <User size={22} />
                  Login
                </Link>

                <Link
                  href="/register"
                  className="flex items-center gap-4 rounded-2xl bg-cyan-500 px-5 py-4 text-base font-bold text-[#07111f] shadow-lg shadow-cyan-500/30 transition hover:bg-cyan-400"
                >
                  <UserPlus size={22} />
                  Register
                </Link>
              </>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-4 rounded-2xl bg-red-500 px-5 py-4 text-base font-semibold text-white transition hover:bg-red-400"
              >
                <LogOut size={22} />
                Logout
              </button>
            )}
          </nav>

          <div className="mt-auto rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 p-4 text-[#07111f] shadow-lg shadow-cyan-500/20">
            <p className="text-sm font-extrabold">Topup cepat & aman</p>
            <p className="mt-1 text-xs font-medium text-[#07111f]/80">
              Payout, vilog, gifting, dan cek transaksi tersedia setiap hari.
            </p>
          </div>
        </div>
      </aside>

      <div className="h-[104px]" />
    </>
  );
}