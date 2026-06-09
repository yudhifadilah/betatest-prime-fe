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

const API_URL =
  process.env.NEXT_PUBLIC_API_URL;

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

  const statusStyle: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Accepted: "bg-purple-100 text-purple-700",
    Process: "bg-blue-100 text-blue-700",
    Success: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const typeStyle: Record<OrderType, string> = {
    vilog: "bg-cyan-100 text-cyan-700",
    payout: "bg-orange-100 text-orange-700",
    lims: "bg-violet-100 text-violet-700",
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
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <div className="relative p-6 md:p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-black/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Admin Overview
              </p>

              <h1 className="mt-3 text-4xl font-bold text-black md:text-5xl">
                Dashboard Admin
              </h1>

              <p className="mt-3 max-w-xl text-neutral-500">
                Menampilkan order terbaru dari Vilog, Payout, dan LIMS sesuai
                role akun yang sedang login.
              </p>
            </div>

            <div className="rounded-3xl bg-black p-5 text-white shadow-xl">
              <p className="text-sm text-white/60">Total Revenue</p>
              <h2 className="mt-2 text-3xl font-bold">
                {formatRupiah(totalRevenue)}
              </h2>

              <div className="mt-4 flex items-center gap-2 text-sm text-white/80">
                <ArrowUpRight size={18} />
                Berdasarkan data order API
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.title}
            className="group rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-black transition group-hover:bg-black group-hover:text-white">
                {item.icon}
              </div>

              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
                Live
              </span>
            </div>

            <p className="mt-5 text-sm font-medium text-neutral-500">
              {item.title}
            </p>

            <h2 className="mt-2 text-3xl font-bold text-black">
              {item.value}
            </h2>

            <p className="mt-2 text-sm text-neutral-400">{item.subtitle}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-[32px] border border-neutral-200 bg-white p-5 shadow-sm md:p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-black">Order Terbaru</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Data gabungan dari Vilog, Payout, dan LIMS.
              </p>
            </div>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-black hover:bg-neutral-100 disabled:opacity-50"
            >
              <RefreshCcw size={16} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-neutral-200">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Order ID
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Tipe
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Produk
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Total
                  </th>
                  <th className="px-5 py-4 text-sm font-semibold text-neutral-500">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-neutral-500"
                    >
                      Mengambil data order...
                    </td>
                  </tr>
                ) : latestOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-neutral-500"
                    >
                      Belum ada order yang bisa ditampilkan.
                    </td>
                  </tr>
                ) : (
                  latestOrders.map((order) => (
                    <tr
                      key={`${order.type}-${order.id}`}
                      className="border-t border-neutral-100"
                    >
                      <td className="px-5 py-4 font-semibold text-black">
                        {order.orderId}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                            typeStyle[order.type]
                          }`}
                        >
                          {order.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-neutral-700">
                        {order.customer}
                      </td>

                      <td className="px-5 py-4 text-neutral-700">
                        {order.product}
                      </td>

                      <td className="px-5 py-4 font-semibold text-black">
                        {formatRupiah(order.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            statusStyle[order.status] ||
                            "bg-neutral-100 text-neutral-700"
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
        </div>

        <div className="rounded-[32px] border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-black">Aktivitas</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Ringkasan status order saat ini.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-4 rounded-3xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>

              <div>
                <p className="font-semibold text-black">Order sukses</p>
                <p className="text-sm text-neutral-500">
                  {successOrders} transaksi berhasil diselesaikan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                <Clock3 size={22} />
              </div>

              <div>
                <p className="font-semibold text-black">Sedang diproses</p>
                <p className="text-sm text-neutral-500">
                  {processOrders} order masih diproses staff.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-3xl bg-neutral-50 p-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-100 text-yellow-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <p className="font-semibold text-black">Pending</p>
                <p className="text-sm text-neutral-500">
                  {pendingOrders} order belum diselesaikan.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}