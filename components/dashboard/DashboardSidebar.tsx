"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ReceiptText,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Search,
  ChevronRight,
  MessageCircle,
  Gem,
  Store,
  CreditCard,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Role = "admin" | "staff" | "buyer" | null;

type MenuItem = {
  label: string;
  href: string;
  icon: ReactNode;
  allowedRoles?: Exclude<Role, null>[];
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "https://betatest-prime.vercel.app"
).replace(/\/+$/, "");

const menus: MenuItem[] = [
  {
    label: "Vilog",
    href: "/dashboard/orders",
    icon: <ReceiptText size={22} />,
    allowedRoles: ["admin"],
  },
  {
    label: "Payout",
    href: "/dashboard/payout",
    icon: <ReceiptText size={22} />,
    allowedRoles: ["admin"],
  },
  {
    label: "Item Limited",
    href: "/dashboard/limited-items",
    icon: <Gem size={22} />,
    allowedRoles: ["staff"],
  },
  {
    label: "Live Chat",
    href: "/dashboard/live-chat",
    icon: <MessageCircle size={22} />,
    allowedRoles: ["admin", "staff"],
  },
  {
    label: "Nomor Rekening",
    href: "/dashboard/rekening",
    icon: <CreditCard size={22} />,
    allowedRoles: ["admin", "staff"],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [nameLabel, setNameLabel] = useState("Unknown");
  const [checking, setChecking] = useState(true);

  const [storeOpen, setStoreOpen] = useState(true);
  const [loadingStore, setLoadingStore] = useState(false);

  const readAuth = () => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role")?.toLowerCase() as Role;
    const savedUser = localStorage.getItem("user");

    if (!token) {
      setRole(null);
      setNameLabel("Unknown");
      setChecking(false);
      router.replace("/");
      return;
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);

        setNameLabel(
          parsedUser?.name ||
            parsedUser?.username ||
            parsedUser?.email ||
            "Unknown"
        );
      } catch {
        setNameLabel("Unknown");
      }
    } else {
      setNameLabel("Unknown");
    }

    if (
      savedRole === "admin" ||
      savedRole === "staff" ||
      savedRole === "buyer"
    ) {
      setRole(savedRole);

      if (savedRole === "buyer") {
        router.replace("/");
      }
    } else {
      setRole(null);
      router.replace("/");
    }

    setChecking(false);
  };

  const getStoreStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/api/store/status`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        console.error("Store status response bukan JSON:", text);
        return;
      }

      setStoreOpen(data?.data?.isStoreOpen ?? true);
    } catch (error) {
      console.error("Gagal mengambil status toko:", error);
    }
  };

  const toggleStore = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !storeOpen;

      setLoadingStore(true);

      const res = await fetch(`${API_URL}/api/store/toggle`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({
          isStoreOpen: newStatus,
        }),
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        alert("Response server bukan JSON");
        return;
      }

      if (!res.ok || !data?.success) {
        alert(data?.message || "Gagal mengubah status toko");
        return;
      }

      setStoreOpen(newStatus);
    } catch (error) {
      console.error("Gagal update status toko:", error);
      alert("Server error saat mengubah status toko");
    } finally {
      setLoadingStore(false);
    }
  };

  useEffect(() => {
    readAuth();
    getStoreStatus();

    window.addEventListener("storage", readAuth);
    window.addEventListener("auth-changed", readAuth);

    return () => {
      window.removeEventListener("storage", readAuth);
      window.removeEventListener("auth-changed", readAuth);
    };
  }, []);

  const filteredMenus = useMemo(() => {
    return menus.filter((menu) => {
      if (!menu.allowedRoles) return true;
      if (!role) return false;
      return menu.allowedRoles.includes(role);
    });
  }, [role]);

  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    setRole(null);
    setNameLabel("Unknown");

    window.dispatchEvent(new Event("auth-changed"));

    router.push("/");
  };

  const roleLabel =
    role === "admin" ? "Admin" : role === "staff" ? "Staff" : "Unknown";

  const LogoBrand = ({
    subtitle = "Admin Control",
    mobile = false,
    onClick,
  }: {
    subtitle?: string;
    mobile?: boolean;
    onClick?: () => void;
  }) => {
    return (
      <Link
        href="/"
        onClick={onClick}
        className="group flex w-fit items-center gap-3 rounded-[24px] transition active:scale-[0.98]"
      >
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-cyan-500/20 bg-white/[0.04] shadow-lg shadow-cyan-500/5 transition group-hover:border-cyan-400/40 ${
            mobile ? "h-11 w-11 rounded-2xl" : "h-14 w-14 rounded-[22px]"
          }`}
        >
          <Image
            src="/images/LogoPrime.png"
            alt="PrimeBlox Logo"
            width={mobile ? 44 : 56}
            height={mobile ? 44 : 56}
            className="h-full w-full object-contain p-1"
            priority
          />
        </div>

        <div>
          <h1
            className={`font-extrabold leading-none text-white transition group-hover:text-cyan-400 ${
              mobile ? "text-xl" : "text-2xl"
            }`}
          >
            PrimeBlox
          </h1>

          <p className={`mt-1 text-gray-400 ${mobile ? "text-xs" : "text-sm"}`}>
            {subtitle}
          </p>
        </div>
      </Link>
    );
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-7">
          <LogoBrand onClick={onNavigate} />
        </div>

        <div className="mb-5 relative overflow-hidden rounded-[26px] border border-cyan-500/20 bg-white/[0.04] p-5 text-white shadow-xl shadow-cyan-500/10 backdrop-blur-md">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.14),transparent_45%)]" />

          <div className="relative flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
              <ShieldCheck size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{roleLabel} Access</p>

              <div className="mt-2 space-y-1">
                <p className="truncate text-xs text-gray-400">
                  Name:
                  <span className="ml-1 font-semibold text-cyan-300">
                    {nameLabel}
                  </span>
                </p>

                <p className="text-xs text-gray-400">
                  Role:
                  <span className="ml-1 font-semibold text-cyan-300">
                    {roleLabel}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="relative mt-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-xs text-gray-400">Status</p>
            <p className="text-sm font-semibold text-cyan-300">
              Online & Verified
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 shadow-sm backdrop-blur-md">
          <Search size={18} className="text-cyan-400" />

          <input
            type="text"
            placeholder="Search menu..."
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>

        <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-400/70">
          Menu
        </div>

        <nav className="flex flex-col gap-2">
          {filteredMenus.map((menu) => {
            const active =
              pathname === menu.href || pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={onNavigate}
                className={`group flex items-center justify-between rounded-[22px] px-3 py-3 font-semibold transition-all ${
                  active
                    ? "border border-cyan-400/30 bg-cyan-500 text-[#07111f] shadow-lg shadow-cyan-500/20"
                    : "border border-transparent text-gray-300 hover:border-cyan-400/20 hover:bg-cyan-500/10 hover:text-cyan-300"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                      active
                        ? "bg-[linear-gradient(180deg,#081426_0%,#07111f_45%,#06101d_100%)]/10 text-[#07111f]"
                        : "border border-white/10 bg-white/[0.04] text-gray-300 group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 group-hover:text-cyan-300"
                    }`}
                  >
                    {menu.icon}

                    {menu.label === "Live Chat" && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-[#07111f]" />
                    )}
                  </span>

                  <span>{menu.label}</span>
                </span>

                <ChevronRight
                  size={18}
                  className={`transition ${
                    active
                      ? "text-[#07111f]"
                      : "text-gray-600 group-hover:text-cyan-300"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-5 pt-6">
          <div className="overflow-hidden rounded-[28px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/10 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-[18px] shadow-sm ${
                    storeOpen
                      ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                      : "border border-red-400/20 bg-red-500/10 text-red-300"
                  }`}
                >
                  <Store size={22} />
                </div>

                <div>
                  <p className="text-sm font-extrabold text-white">
                    Status Toko
                  </p>

                  <p
                    className={`mt-1 text-xs font-semibold ${
                      storeOpen ? "text-emerald-300" : "text-red-300"
                    }`}
                  >
                    {storeOpen ? "Toko Sedang Buka" : "Toko Sedang Tutup"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleStore}
                disabled={loadingStore}
                className={`relative h-8 w-14 shrink-0 rounded-full shadow-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                  storeOpen
                    ? "bg-emerald-500 shadow-emerald-500/30"
                    : "bg-red-500 shadow-red-500/30"
                }`}
                aria-label="Toggle status toko"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    storeOpen ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-[24px] border border-red-400/20 bg-red-500/90 py-4 font-bold text-white shadow-xl shadow-red-500/20 transition-all duration-300 hover:bg-red-500 active:scale-[0.98]"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    );
  };

  if (checking) {
    return null;
  }

  return (
    <>
      <header className="fixed left-0 top-0 z-[9999] flex h-16 w-full items-center justify-between border-b border-cyan-500/10 bg-[linear-gradient(180deg,#081426_0%,#07111f_45%,#06101d_100%)]/95 px-5 shadow-lg shadow-cyan-500/5 backdrop-blur-xl md:hidden">
        <LogoBrand
          subtitle="Admin Panel"
          mobile
          onClick={() => setOpen(false)}
        />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 shadow-sm transition active:scale-95"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-[9998] md:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full bg-black/60 backdrop-blur-md"
            aria-label="Close sidebar overlay"
          />

          <aside className="absolute left-0 top-0 z-[9999] h-full w-[88%] max-w-sm overflow-y-auto rounded-r-[36px] border-r border-cyan-500/10 bg-[linear-gradient(180deg,#081426_0%,#07111f_45%,#06101d_100%)] p-5 shadow-[0_0_40px_rgba(0,255,255,0.06)] backdrop-blur-2xl">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300 shadow-sm"
                aria-label="Close sidebar"
              >
                <X size={22} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-col overflow-y-auto border-r border-cyan-500/10 bg-[linear-gradient(180deg,#081426_0%,#07111f_45%,#06101d_100%)] p-5 shadow-[0_0_40px_rgba(0,255,255,0.04)] backdrop-blur-2xl md:flex">
        <SidebarContent />
      </aside>
    </>
  );
}