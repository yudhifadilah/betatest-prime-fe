"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  ReceiptText,
  Users,
  Wallet,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

type Role = "admin" | "staff" | "buyer" | null;
type OrderType = "vilog" | "payout" | "lims";

type DashboardOrder = {
  id: number | string;
  orderId: string;
  customer: string;
  product: string;
  amount: number;
  status: string;
  type: OrderType;
  createdAt?: string;
};

const statusStyle: Record<string, string> = {
  Pending: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
  Accepted: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  Process: "border-blue-400/20 bg-blue-500/10 text-blue-300",
  Success: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  Cancelled: "border-red-400/20 bg-red-500/10 text-red-300",
};

const typeStyle: Record<OrderType, string> = {
  vilog: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300",
  payout: "border-orange-400/20 bg-orange-500/10 text-orange-300",
  lims: "border-violet-400/20 bg-violet-500/10 text-violet-300",
};

export default function DashboardPage() {
  const [role, setRole] = useState<Role>(null);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const getRole = () => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("role")?.toLowerCase() as Role) || null;
  };

  const formatRupiah = (value: number) => {
    return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
  };

  const normalizeStatus = (status?: string) => {
    const value = (status || "pending").toLowerCase();

    if (value === "completed" || value === "success") return "Success";
    if (value === "processing" || value === "process") return "Process";
    if (value === "cancelled" || value === "canceled") return "Cancelled";
    if (value === "accepted") return "Accepted";

    return "Pending";
  };

  const safeFetch = async (url: string) => {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    });

    const text = await response.text();

    let result: any = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      console.error("Response bukan JSON:", url, text);
      return [];
    }

    if (!response.ok) {
      console.error("API error:", url, result);
      return [];
    }

    return Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.orders)
      ? result.orders
      : Array.isArray(result)
      ? result
      : [];
  };

  const loadOrders = async () => {
    try {
      setLoading(true);

      const currentRole = getRole();
      setRole(currentRole);

      const requests: Promise<any[]>[] = [];

      if (currentRole === "admin") {
        requests.push(safeFetch(`${API_URL}/api/vilog/orders`));
        requests.push(safeFetch(`${API_URL}/api/payout/orders`));
      }

      if (currentRole === "staff") {
        requests.push(safeFetch(`${API_URL}/api/lims/orders`));
      }

      if (currentRole === "admin" || currentRole === "staff") {
        requests.push(safeFetch(`${API_URL}/api/lims/orders`));
      }

      const results = await Promise.all(requests);
      const mergedRaw = results.flat();

      const normalized: DashboardOrder[] = mergedRaw.map((item: any) => {
        const type: OrderType =
          item.productType ||
          item.type ||
          item.kategori ||
          (item.limsProdukId ? "lims" : item.vilogProdukId ? "vilog" : "payout");

        return {
          id: item.id,
          orderId: item.orderId || `ORD-${item.id}`,
          customer:
            item.buyerName ||
            item.robloxUsername ||
            item.username ||
            item.customer ||
            "-",
          product:
            item.productName ||
            item.namaProduk ||
            item.namaItem ||
            item.product ||
            type.toUpperCase(),
          amount:
            Number(item.totalPrice) ||
            Number(item.harga) ||
            Number(item.amount) ||
            0,
          status: normalizeStatus(item.status),
          type,
          createdAt: item.createdAt,
        };
      });

      const sorted = normalized.sort((a, b) => {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });

      setOrders(sorted);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const latestOrders = orders.slice(0, 8);

  const totalRevenue = useMemo(() => {
    return orders.reduce((total, order) => total + Number(order.amount || 0), 0);
  }, [orders]);

  const successOrders = orders.filter((item) => item.status === "Success").length;
  const processOrders = orders.filter((item) => item.status === "Process").length;
  const pendingOrders = orders.filter((item) => item.status === "Pending").length;

  const stats = [
    {
      title: "Total Produk",
      value: "-",
      subtitle: "Vilog, Payout, dan LIMS",
      icon: <Package size={24} />,
    },
    {
      title: "Total Order",
      value: String(orders.length),
      subtitle: `${latestOrders.length} order terbaru tampil`,
      icon: <ReceiptText size={24} />,
    },
    {
      title: "Role Aktif",
      value: role === "admin" ? "Admin" : role === "staff" ? "Staff" : "-",
      subtitle: "Data mengikuti hak akses akun",
      icon: <Users size={24} />,
    },
    {
      title: "Revenue",
      value: formatRupiah(totalRevenue),
      subtitle: "Total dari order yang terbaca",
      icon: <Wallet size={24} />,
    },
  ];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07111f] px-5 pb-10 pt-24 text-white md:px-8 md:pt-8">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#07111f]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_15%_10%,rgba(6,182,212,0.18),transparent_30%),radial-gradient(circle_at_85%_8%,rgba(37,99,235,0.20),transparent_32%),radial-gradient(circle_at_80%_85%,rgba(37,99,235,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.18),transparent_35%)]" />

          <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">
                <ReceiptText size={18} />
                Admin Overview
              </div>

              <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                Dashboard Admin
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                Menampilkan order terbaru dari Vilog, Payout, dan LIMS sesuai
                role akun yang sedang login.
              </p>
            </div>

            <div className="rounded-[30px] border border-cyan-400/20 bg-cyan-500/10 p-5 shadow-xl shadow-cyan-500/20">
              <p className="text-sm font-bold text-cyan-300">Total Revenue</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {formatRupiah(totalRevenue)}
              </h2>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <ArrowUpRight size={18} className="text-cyan-300" />
                Berdasarkan data order API
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              subtitle={item.subtitle}
              icon={item.icon}
            />
          ))}
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                Order Terbaru
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Data gabungan dari Vilog, Payout, dan LIMS.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-[30px] border border-white/10 bg-[#0b1627]/50">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <thead className="border-b border-white/10 bg-cyan-500/10 text-sm text-cyan-200">
                <tr>
                  <th className="px-5 py-4">Order ID</th>
                  <th className="px-5 py-4">Tipe</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Produk</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                      Mengambil data order...
                    </td>
                  </tr>
                ) : latestOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                      Belum ada order yang bisa ditampilkan.
                    </td>
                  </tr>
                ) : (
                  latestOrders.map((order) => (
                    <tr
                      key={`${order.type}-${order.id}`}
                      className="border-b border-white/10 text-sm transition last:border-b-0 hover:bg-cyan-500/5"
                    >
                      <td className="px-5 py-4 font-extrabold text-white">
                        {order.orderId}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
                            typeStyle[order.type]
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {order.customer}
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {order.product}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-cyan-300">
                        {formatRupiah(order.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            statusStyle[order.status] ||
                            "border-white/10 bg-white/[0.04] text-gray-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group rounded-[28px] border border-cyan-500/20 bg-white/[0.04] p-5 shadow-xl shadow-cyan-500/5 backdrop-blur-md transition hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-cyan-500/5">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500 group-hover:text-[#07111f]">
          {icon}
        </div>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
          Live
        </span>
      </div>

      <p className="mt-5 text-sm font-bold text-gray-400">{title}</p>

      <h2 className="mt-2 text-3xl font-black text-white">{value}</h2>

      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

