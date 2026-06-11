"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Gem,
  Plus,
  Pencil,
  Trash2,
  RefreshCcw,
  Search,
  CheckCircle2,
  XCircle,
  ShoppingCart,
  ReceiptText,
  PackageCheck,
  Clock3,
} from "lucide-react";

type LimsItem = {
  id: number;
  namaItem: string;
  assetId: string;
  harga: number;
  isActive?: boolean;
  isTumbalAvailable?: boolean;
};

type LimsOrder = {
  id: number;
  orderId?: string;
  robloxUsername?: string;
  buyerName?: string;
  productName?: string;
  namaItem?: string;
  assetId?: string;
  price?: number;
  harga?: number;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

const endpoint = "/api/lims/produk";

const getOrderStatusStyle = (status?: string, paymentStatus?: string) => {
  const currentStatus = (
    paymentStatus === "unpaid" ? "unpaid" : status || "pending"
  ).toLowerCase();

  switch (currentStatus) {
    case "unpaid":
      return {
        className: "border-orange-400/20 bg-orange-500/10 text-orange-300",
        label: "Belum Bayar",
      };

    case "pending":
      return {
        className: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
        label: "Pending",
      };

    case "accepted":
      return {
        className: "border-indigo-400/20 bg-indigo-500/10 text-indigo-300",
        label: "Diterima",
      };

    case "processing":
      return {
        className: "border-blue-400/20 bg-blue-500/10 text-blue-300",
        label: "Diproses",
      };

    case "completed":
    case "selesai":
      return {
        className: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
        label: "Selesai",
      };

    case "cancelled":
    case "canceled":
      return {
        className: "border-red-400/20 bg-red-500/10 text-red-300",
        label: "Dibatalkan",
      };

    default:
      return {
        className: "border-white/10 bg-white/[0.04] text-gray-300",
        label: status || "Unknown",
      };
  }
};

export default function DashboardLimitedItemsPage() {
  const [items, setItems] = useState<LimsItem[]>([]);
  const [orders, setOrders] = useState<LimsOrder[]>([]);
  const [search, setSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    namaItem: "",
    assetId: "",
    harga: "",
    isActive: true,
  });

  const filteredItems = useMemo(() => {
    return items.filter((item) =>
      item.namaItem.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const keyword = orderSearch.toLowerCase();

      return (
        order.orderId?.toLowerCase().includes(keyword) ||
        order.robloxUsername?.toLowerCase().includes(keyword) ||
        order.buyerName?.toLowerCase().includes(keyword) ||
        order.productName?.toLowerCase().includes(keyword) ||
        order.namaItem?.toLowerCase().includes(keyword)
      );
    });
  }, [orders, orderSearch]);

  const activeItems = items.filter((item) => item.isActive !== false).length;
  const inactiveItems = items.filter((item) => item.isActive === false).length;
  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.paymentStatus === "unpaid" ||
      !order.status
  ).length;

  const resetForm = () => {
    setEditingId(null);
    setForm({
      namaItem: "",
      assetId: "",
      harga: "",
      isActive: true,
    });
  };

  const getToken = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  };

  const safeJson = async (response: Response) => {
    const text = await response.text();

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      throw new Error("Response server bukan JSON");
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil data");
      }

      setItems(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);

      const res = await fetch(`${API_URL}/api/lims/orders`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json.message || "Gagal mengambil order LIMS");
      }

      setOrders(Array.isArray(json.data) ? json.data : []);
    } catch (error) {
      console.error(error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.namaItem || !form.assetId || !form.harga) {
      alert("Nama item, asset ID, dan harga wajib diisi");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        namaItem: form.namaItem,
        assetId: form.assetId,
        harga: Number(form.harga),
        isActive: form.isActive,
        isTumbalAvailable: false,
      };

      const url = editingId
        ? `${API_URL}${endpoint}/${editingId}`
        : `${API_URL}${endpoint}`;

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json.message || "Gagal menyimpan data");
      }

      resetForm();
      await loadItems();
      alert(editingId ? "Item berhasil diupdate" : "Item berhasil ditambahkan");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan data");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: LimsItem) => {
    setEditingId(item.id);
    setForm({
      namaItem: item.namaItem,
      assetId: item.assetId,
      harga: String(item.harga),
      isActive: item.isActive !== false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Yakin ingin menghapus item ini?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json.message || "Gagal menghapus item");
      }

      await loadItems();
      alert("Item berhasil dihapus");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus item");
    }
  };

  const updateOrderStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${API_URL}/api/lims/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });

      const json = await safeJson(res);

      if (!res.ok) {
        throw new Error(json.message || "Gagal update status order");
      }

      await loadOrders();
      alert("Status order berhasil diupdate");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Gagal update status order"
      );
    }
  };

  useEffect(() => {
    loadItems();
    loadOrders();
  }, []);

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
                <Gem size={18} />
                LIMS Management
              </div>

              <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                Item Limited
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
                Kelola item limited dan order LIMS dengan tampilan PrimeBlox
                modern.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                loadItems();
                loadOrders();
              }}
              disabled={loading || loadingOrders}
              className="flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
            >
              <RefreshCcw
                size={20}
                className={loading || loadingOrders ? "animate-spin" : ""}
              />
              {loading || loadingOrders ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </section>

        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Item"
            value={items.length}
            subtitle="Semua item limited"
            icon={<PackageCheck size={24} />}
          />

          <StatCard
            title="Item Aktif"
            value={activeItems}
            subtitle="Siap tampil"
            icon={<CheckCircle2 size={24} />}
          />

          <StatCard
            title="Tidak Aktif"
            value={inactiveItems}
            subtitle="Disembunyikan"
            icon={<XCircle size={24} />}
          />

          <StatCard
            title="Order Pending"
            value={pendingOrders}
            subtitle="Perlu diproses"
            icon={<Clock3 size={24} />}
          />
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                {editingId ? "Edit Item Limited" : "Tambah Item Limited"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-400">
                Isi data item limited dengan benar sebelum disimpan.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/10"
              >
                Batal Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              type="text"
              placeholder="Nama item"
              value={form.namaItem}
              onChange={(e) => setForm({ ...form, namaItem: e.target.value })}
              className="rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
            />

            <input
              type="text"
              placeholder="Asset ID"
              value={form.assetId}
              onChange={(e) => setForm({ ...form, assetId: e.target.value })}
              className="rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
            />

            <input
              type="number"
              placeholder="Harga"
              value={form.harga}
              onChange={(e) => setForm({ ...form, harga: e.target.value })}
              className="rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
            />

            <select
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) =>
                setForm({ ...form, isActive: e.target.value === "active" })
              }
              className="rounded-2xl border border-white/10 bg-[#0b1627]/90 px-5 py-4 text-sm text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10"
            >
              <option value="active" className="bg-[#07111f] text-white">
                Aktif
              </option>
              <option value="inactive" className="bg-[#07111f] text-white">
                Tidak Aktif
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-extrabold text-[#07111f] shadow-xl shadow-cyan-500/30 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            <Plus size={20} />
            {saving
              ? "Menyimpan..."
              : editingId
              ? "Update Item Limited"
              : "Tambah Item Limited"}
          </button>
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-2xl font-black text-white">
                Daftar Item Limited
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Total: {filteredItems.length} item
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <Search size={18} className="text-cyan-400" />
                <input
                  type="text"
                  placeholder="Cari item..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <button
                type="button"
                onClick={loadItems}
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-50"
              >
                <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <EmptyState text="Loading data item..." compact />
          ) : filteredItems.length === 0 ? (
            <EmptyState text="Item limited belum tersedia." compact />
          ) : (
            <div className="overflow-x-auto rounded-[30px] border border-white/10 bg-[#0b1627]/50">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead className="border-b border-white/10 bg-cyan-500/10 text-sm text-cyan-200">
                  <tr>
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Asset ID</th>
                    <th className="px-5 py-4">Harga</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/10 text-sm transition last:border-b-0 hover:bg-cyan-500/5"
                    >
                      <td className="px-5 py-4">
                        <div className="font-extrabold text-white">
                          {item.namaItem}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          ID: {item.id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-300">
                        {item.assetId}
                      </td>

                      <td className="px-5 py-4 font-extrabold text-cyan-300">
                        Rp {Number(item.harga).toLocaleString("id-ID")}
                      </td>

                      <td className="px-5 py-4">
                        {item.isActive === false ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 font-bold text-red-300">
                            <XCircle size={16} />
                            Tidak Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 font-bold text-emerald-300">
                            <CheckCircle2 size={16} />
                            Aktif
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 font-bold text-red-300 transition hover:bg-red-500/20"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-[34px] border border-cyan-500/20 bg-white/[0.04] p-6 shadow-2xl shadow-cyan-500/10 backdrop-blur-md md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                <ShoppingCart size={26} className="text-cyan-400" />
                Order Item Limited
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Daftar order item limited dari user.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1627]/80 px-4 py-3 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-400/10">
                <Search size={18} className="text-cyan-400" />
                <input
                  type="text"
                  placeholder="Cari order..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
                />
              </div>

              <button
                type="button"
                onClick={loadOrders}
                disabled={loadingOrders}
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-50"
              >
                <RefreshCcw
                  size={18}
                  className={loadingOrders ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <EmptyState text="Loading order LIMS..." compact />
          ) : filteredOrders.length === 0 ? (
            <EmptyState text="Belum ada order item limited." compact />
          ) : (
            <div className="overflow-x-auto rounded-[30px] border border-white/10 bg-[#0b1627]/50">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead className="border-b border-white/10 bg-cyan-500/10 text-sm text-cyan-200">
                  <tr>
                    <th className="px-5 py-4">Order</th>
                    <th className="px-5 py-4">Buyer</th>
                    <th className="px-5 py-4">Item</th>
                    <th className="px-5 py-4">Asset ID</th>
                    <th className="px-5 py-4">Harga</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Aksi</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => {
                    const itemName = order.productName || order.namaItem || "-";
                    const price = order.price || order.harga || 0;
                    const statusConfig = getOrderStatusStyle(
                      order.status,
                      order.paymentStatus
                    );

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-white/10 text-sm transition last:border-b-0 hover:bg-cyan-500/5"
                      >
                        <td className="px-5 py-4">
                          <div className="font-extrabold text-white">
                            {order.orderId || `#${order.id}`}
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString(
                                  "id-ID"
                                )
                              : "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-white">
                            {order.robloxUsername || order.buyerName || "-"}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {itemName}
                        </td>

                        <td className="px-5 py-4 text-gray-300">
                          {order.assetId || "-"}
                        </td>

                        <td className="px-5 py-4 font-extrabold text-cyan-300">
                          Rp {Number(price).toLocaleString("id-ID")}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-bold capitalize ${statusConfig.className}`}
                          >
                            <ReceiptText size={16} />
                            {statusConfig.label}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "processing")
                              }
                              className="rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-2 font-bold text-blue-300 transition hover:bg-blue-500/20"
                            >
                              Proses
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "completed")
                              }
                              className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 font-bold text-emerald-300 transition hover:bg-emerald-500/20"
                            >
                              Selesai
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                updateOrderStatus(order.id, "cancelled")
                              }
                              className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 font-bold text-red-300 transition hover:bg-red-500/20"
                            >
                              Batal
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
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
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400 transition group-hover:bg-cyan-500 group-hover:text-[#07111f]">
        {icon}
      </div>

      <p className="mt-5 text-sm font-bold text-gray-400">{title}</p>
      <h2 className="mt-2 text-3xl font-black text-white">{value}</h2>
      <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

function EmptyState({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[30px] border border-dashed border-white/10 bg-white/[0.04] p-8 text-center ${
        compact ? "min-h-[220px]" : "min-h-[260px]"
      }`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-cyan-400/20 bg-cyan-500/10">
        <ReceiptText size={30} className="text-cyan-400" />
      </div>

      <h3 className="mt-5 text-lg font-black text-white">Tidak Ada Data</h3>

      <p className="mt-2 max-w-sm text-sm text-gray-400">{text}</p>
    </div>
  );
}
