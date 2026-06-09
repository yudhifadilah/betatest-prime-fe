"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ReceiptText,
  Users,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Bell,
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
  }: {
    subtitle?: string;
    mobile?: boolean;
  }) => {
    return (
      <div className="flex items-center gap-3">
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-black shadow-lg ${
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
            className={`font-bold leading-none text-black ${
              mobile ? "text-xl" : "text-2xl"
            }`}
          >
            PrimeBlox
          </h1>

          <p
            className={`mt-1 text-neutral-500 ${
              mobile ? "text-xs" : "text-sm"
            }`}
          >
            {subtitle}
          </p>
        </div>
      </div>
    );
  };

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-7">
          <LogoBrand />
        </div>

        <div className="mb-5 rounded-[26px] border border-neutral-200 bg-gradient-to-br from-neutral-950 to-neutral-800 p-5 text-white shadow-xl">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10">
              <ShieldCheck size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold">{roleLabel} Access</p>

              <div className="mt-2 space-y-1">
                <p className="truncate text-xs text-white/60">
                  Name:
                  <span className="ml-1 font-semibold text-white">
                    {nameLabel}
                  </span>
                </p>

                <p className="text-xs text-white/60">
                  Role:
                  <span className="ml-1 font-semibold text-white">
                    {roleLabel}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white/10 px-4 py-3">
            <p className="text-xs text-white/60">Status</p>
            <p className="text-sm font-semibold text-white">
              Online & Verified
            </p>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
          <Search size={18} className="text-neutral-400" />

          <input
            type="text"
            placeholder="Search menu..."
            className="w-full bg-transparent text-sm text-black outline-none placeholder:text-neutral-400"
          />
        </div>

        <div className="mb-3 px-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-400">
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
                    ? "bg-black text-white shadow-lg"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`relative flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                      active
                        ? "bg-white/15 text-white"
                        : "bg-neutral-100 text-neutral-700 group-hover:bg-white"
                    }`}
                  >
                    {menu.icon}

                    {menu.label === "Live Chat" && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </span>

                  <span>{menu.label}</span>
                </span>

                <ChevronRight
                  size={18}
                  className={`transition ${
                    active
                      ? "text-white"
                      : "text-neutral-300 group-hover:text-neutral-700"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4 pt-6">
          <div className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Bell size={18} className="text-black" />
              <p className="font-bold text-black">Order Alert</p>
            </div>

            <p className="text-sm text-neutral-500">
              8 order baru menunggu diproses hari ini.
            </p>
          </div>

          <div className="rounded-[26px] border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    storeOpen
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <Store size={21} />
                </div>

                <div>
                  <p className="font-bold text-black">Status Toko</p>
                  <p
                    className={`text-sm font-medium ${
                      storeOpen ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {storeOpen ? "Toko sedang buka" : "Toko sedang tutup"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleStore}
                disabled={loadingStore}
                className={`relative h-8 w-14 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  storeOpen ? "bg-green-500" : "bg-red-500"
                }`}
                aria-label="Toggle status toko"
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition ${
                    storeOpen ? "left-7" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-red-500 py-4 font-semibold text-white shadow-lg transition hover:bg-red-600 active:scale-[0.98]"
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
      <header className="fixed left-0 top-0 z-[9999] flex h-16 w-full items-center justify-between border-b border-neutral-200 bg-white/85 px-5 shadow-sm backdrop-blur-xl md:hidden">
        <LogoBrand subtitle="Admin Panel" mobile />

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-black shadow-sm transition active:scale-95"
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
            className="absolute inset-0 h-full w-full bg-black/40 backdrop-blur-md"
            aria-label="Close sidebar overlay"
          />

          <aside className="absolute left-0 top-0 z-[9999] h-full w-[88%] max-w-sm overflow-y-auto rounded-r-[36px] border-r border-white/40 bg-white/95 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="mb-5 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-200 bg-white text-black shadow-sm"
                aria-label="Close sidebar"
              >
                <X size={22} />
              </button>
            </div>

            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-80 flex-col overflow-y-auto border-r border-neutral-200 bg-white/95 p-5 shadow-sm backdrop-blur-xl md:flex">
        <SidebarContent />
      </aside>
    </>
  );
}